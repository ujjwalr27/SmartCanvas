import { NextRequest, NextResponse } from 'next/server';
import { geminiFlash } from '@/lib/gemini';
import { Layout, ComplianceViolation } from '@/lib/types';

interface CheckComplianceRequest {
    layout: Layout;
    rules: {
        id: string;
        description: string;
        ruleType: string;
        configuration: any;
        severity: 'error' | 'warning';
    }[];
}

export async function POST(request: NextRequest) {
    try {
        const body: CheckComplianceRequest = await request.json();
        const { layout, rules } = body;

        // Default rules if none provided
        const defaultRules = [
            {
                id: 'safe-zone',
                description: 'Elements must be at least 40px from canvas edges',
                ruleType: 'spacing',
                configuration: { minMargin: 40 },
                severity: 'warning' as const,
            },
            {
                id: 'text-readability',
                description: 'Text should be large enough to read (minimum 14px)',
                ruleType: 'text',
                configuration: { minFontSize: 14 },
                severity: 'warning' as const,
            },
            {
                id: 'no-overlap',
                description: 'Elements should not overlap significantly',
                ruleType: 'spacing',
                configuration: {},
                severity: 'warning' as const,
            },
        ];

        const rulesToCheck = rules.length > 0 ? rules : defaultRules;

        const prompt = `Analyze this ad design for compliance issues.

Design:
${JSON.stringify(layout, null, 2)}

Rules to check:
${rulesToCheck.map(r => `- ${r.description} (${r.severity})`).join('\n')}

Analyze the layout and return violations as JSON:
{
  "violations": [
    {
      "ruleId": "rule-id",
      "severity": "error|warning",
      "issue": "description of the issue",
      "suggestion": "how to fix it",
      "elementId": "affected-element-id"
    }
  ]
}

Be strict but fair. Return empty array if no violations.`;

        // Check if Gemini is available
        if (!geminiFlash) {
            // Return no violations when AI is not configured
            return NextResponse.json({ violations: [], passed: true });
        }

        const result = await geminiFlash.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                responseMimeType: 'application/json',
            },
        });

        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const data = JSON.parse(cleanText);

        const violations: ComplianceViolation[] = data.violations || [];

        return NextResponse.json({ violations, passed: violations.length === 0 });
    } catch (error: any) {
        console.error('Error checking compliance:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check compliance' },
            { status: 500 }
        );
    }
}
