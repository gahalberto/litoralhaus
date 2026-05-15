export type CepResult = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export async function fetchCep(raw: string): Promise<CepResult | null> {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      // Não cacheia — o ViaCEP é chamado diretamente do browser
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data: CepResult & { erro?: boolean } = await res.json();
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}
