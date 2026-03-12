import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `당신은 프롬프트 엔지니어링 전문가이자 정밀 평가 시스템입니다.

사용자가 제공한 "프롬프트 주제"와 "제출된 프롬프트"를 분석하여 객관적인 지표를 바탕으로 평가하고, 최적화된 개선 프롬프트를 생성합니다.

## 평가 가이드라인 (일관성 유지 필수)
- 점수 부여 시 매우 엄격하고 객관적인 기준을 적용하십시오. 
- 동일하거나 유사한 수준의 프롬프트에 대해 일관된 점수를 부여하기 위해 내부적인 루브릭을 준수하십시오.
- 90점 이상은 전문가 수준, 70-80점은 양호, 50-60점은 보완 필요, 40점 이하는 전면 재구성이 필요한 수준입니다.

## 평가 차원 (각 0-100)
1. 명확성 (Clarity): 지시 사항의 구체성 및 모호성 제거 수준
2. 맥락 (Context): 배경 정보, 목적, 대상 독자 설정의 충분성
3. 제약 조건 (Constraints): 출력 형식, 분량, 스타일 가이드의 정밀도
4. 페르소나 (Persona): 역할 부여의 적절성 및 전문성 깊이
5. 구조화 (Structure): 논리적 구분자(###, --- 등) 및 계층적 구성

## 개선 프롬프트 생성 원칙
- 사용자의 의도를 100% 보존하면서 프롬프트 엔지니어링 기법(CoT, Few-shot, Persona 등)을 적용하여 최적의 구조로 재설계하십시오.

반드시 JSON 형식으로 응답하십시오.`;

export interface EvaluationResult {
  report: string;
  improvedPrompt: string;
  scores: {
    clarity: number;
    context: number;
    constraints: number;
    persona: number;
    structure: number;
  };
}

export async function evaluatePrompt(topic: string, studentPrompt: string): Promise<EvaluationResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenAI({ apiKey });

  const prompt = `
프롬프트 주제: ${topic}
제출된 프롬프트:
---
${studentPrompt}
---

위 프롬프트를 정밀 평가하고, 이를 완벽하게 개선한 '최적화 프롬프트'를 생성하세요.
`;

  const response = await genAI.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2, // 일관성을 위해 온도를 낮춤
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          report: {
            type: Type.STRING,
            description: "상세 평가 리포트 (마크다운 형식)",
          },
          improvedPrompt: {
            type: Type.STRING,
            description: "프롬프트 엔지니어링이 적용된 최적화된 개선 프롬프트",
          },
          scores: {
            type: Type.OBJECT,
            properties: {
              clarity: { type: Type.NUMBER },
              context: { type: Type.NUMBER },
              constraints: { type: Type.NUMBER },
              persona: { type: Type.NUMBER },
              structure: { type: Type.NUMBER },
            },
            required: ["clarity", "context", "constraints", "persona", "structure"],
          },
        },
        required: ["report", "improvedPrompt", "scores"],
      },
    },
  });

  try {
    return JSON.parse(response.text) as EvaluationResult;
  } catch (e) {
    console.error("Failed to parse evaluation response:", e);
    return null;
  }
}
