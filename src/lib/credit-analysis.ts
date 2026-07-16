export type WorkRegime =
  | "CLT"
  | "PJ"
  | "MEI"
  | "Informal"
  | "Autônomo"
  | "Motorista/entregador de app"
  | "Não trabalho"
  | "Outro";

export interface CreditAnalysisInput {
  name: string;
  birthYear: number;
  income: number;
  workRegime: WorkRegime | "";
  firstProperty: boolean;
  downPayment: number;
}

export interface CreditAnalysisResult {
  age: number;
  program: "MCMV" | "SBPE";
  faixa: string | null;
  maxInstallment: number;
  maxTermMonths: number;
  maxTermYears: number;
  estimatedPropertyCeiling: number;
  requiredDownPayment: number;
  downPaymentGap: number;
  registryDiscount: boolean;
  documents: string[];
}

const MCMV_INCOME_CEILING = 13000;
const MCMV_MONTHLY_RATE = 0.0065; // ~8.1% a.a., subsidiado
const SBPE_MONTHLY_RATE = 0.0083; // ~10.5% a.a., mercado
const INSTALLMENT_SHARE = 0.3;
const MIN_DOWN_PAYMENT_SHARE = 0.2;
const MAX_TERM_MONTHS = 420; // 35 anos, teto usual de mercado
const MIN_TERM_MONTHS = 60;
const MAX_BUYER_AGE_AT_PAYOFF = 80;

function mcmvFaixa(income: number): string {
  if (income <= 3200) return "Faixa 1";
  if (income <= 5000) return "Faixa 2";
  if (income <= 9600) return "Faixa 3";
  return "Faixa 4";
}

// Valor presente de uma série de parcelas iguais (fórmula de financiamento).
function presentValueOfInstallments(installment: number, monthlyRate: number, months: number): number {
  if (months <= 0) return 0;
  return (installment * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate;
}

const DOCUMENTS_BY_REGIME: Record<WorkRegime, string[]> = {
  CLT: [
    "3 últimos holerites (contracheques)",
    "Carteira de trabalho digital atualizada",
  ],
  MEI: [
    "Declaração de Imposto de Renda (DIRPF) do último ano",
    "Declaração Anual do Simples Nacional (DASN-SIMEI)",
    "Extratos bancários de pessoa física e jurídica dos últimos 3 meses",
  ],
  PJ: [
    "Declaração de Imposto de Renda (DIRPF) do último ano",
    "Contrato social e último balanço/faturamento da empresa",
    "Extratos bancários de pessoa física e jurídica dos últimos 3 meses",
  ],
  "Autônomo": [
    "Extratos de movimentação da conta corrente dos últimos 3 a 6 meses",
    "Declaração de Imposto de Renda (DIRPF), se disponível",
  ],
  Informal: [
    "Extratos de movimentação da conta corrente dos últimos 3 a 6 meses",
    "Qualquer comprovante complementar de renda que você tiver (recibos, contratos)",
  ],
  "Motorista/entregador de app": [
    "Comprovantes de repasse/extratos de pagamento das últimas 4 semanas direto do aplicativo",
    "Extratos bancários correspondentes ao mesmo período",
  ],
  "Não trabalho": [],
  Outro: [
    "Vamos alinhar juntos, diretamente com nossa equipe de crédito, os documentos específicos do seu caso",
  ],
};

export function analyzeCredit(input: CreditAnalysisInput): CreditAnalysisResult {
  const age = new Date().getFullYear() - input.birthYear;
  const program: CreditAnalysisResult["program"] =
    input.income <= MCMV_INCOME_CEILING ? "MCMV" : "SBPE";
  const faixa = program === "MCMV" ? mcmvFaixa(input.income) : null;

  const monthlyRate = program === "MCMV" ? MCMV_MONTHLY_RATE : SBPE_MONTHLY_RATE;
  const maxTermMonths = Math.min(
    MAX_TERM_MONTHS,
    Math.max(MIN_TERM_MONTHS, (MAX_BUYER_AGE_AT_PAYOFF - age) * 12)
  );

  const maxInstallment = input.income * INSTALLMENT_SHARE;
  const financedAmount = presentValueOfInstallments(maxInstallment, monthlyRate, maxTermMonths);
  const estimatedPropertyCeiling = financedAmount / (1 - MIN_DOWN_PAYMENT_SHARE);
  const requiredDownPayment = estimatedPropertyCeiling * MIN_DOWN_PAYMENT_SHARE;
  const downPaymentGap = requiredDownPayment - input.downPayment;

  const documents = input.workRegime ? DOCUMENTS_BY_REGIME[input.workRegime] : [];

  return {
    age,
    program,
    faixa,
    maxInstallment,
    maxTermMonths,
    maxTermYears: Math.round(maxTermMonths / 12),
    estimatedPropertyCeiling,
    requiredDownPayment,
    downPaymentGap,
    registryDiscount: input.firstProperty,
    documents,
  };
}
