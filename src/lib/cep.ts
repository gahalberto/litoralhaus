export type CepResult = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export type Coordinates = { lat: number; lng: number };

export async function geocodeAddress(
  logradouro: string,
  bairro: string,
  localidade: string,
  uf: string,
): Promise<Coordinates | null> {
  const q = [logradouro, bairro, localidade, uf, "Brasil"]
    .filter(Boolean)
    .join(", ");
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      {
        headers: { "User-Agent": "LitoralHaus/1.0 (gahalberto1996@gmail.com)" },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const data = await res.json() as Array<{ lat: string; lon: string }>;
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

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
