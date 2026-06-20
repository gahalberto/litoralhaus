import Image from "next/image";

const GROUP_LINK = "https://chat.whatsapp.com/D3xUeEvIY7U4vc8uqOOmWV?s=cl&p=i&ilr=4";

export function WhatsAppGroupBanner() {
  return (
    <a
      href={GROUP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="not-prose my-8 block transition-opacity hover:opacity-95 active:opacity-90"
      aria-label="Entrar no grupo do WhatsApp da Litoral Haus"
    >
      <Image
        src="/banners/grupo-whatsapp.png"
        alt="Grupo do WhatsApp Litoral Haus — clique para entrar"
        width={1200}
        height={400}
        className="w-full rounded-xl"
        priority={false}
      />
    </a>
  );
}
