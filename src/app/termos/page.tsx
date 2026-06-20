import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Termos e Condições de Uso",
  description: "Termos e condições de uso do site e dos serviços de intermediação imobiliária da Litoral Haus.",
  robots: { index: true, follow: true },
};

const LAST_UPDATE = "20 de junho de 2026";
const EMAIL = "contato@litoralhaus.com.br";

export default function TermosPage() {
  return (
    <>
      <Navbar />

      <main className="bg-white">
        {/* Hero */}
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-14">
          <div className="mx-auto max-w-3xl">
            <p className="font-inter text-xs uppercase tracking-widest text-amber-600">Legal</p>
            <h1 className="mt-2 font-cormorant text-4xl font-semibold text-gray-900">
              Termos e Condições de Uso
            </h1>
            <p className="mt-3 font-inter text-sm text-gray-500">
              Última atualização: {LAST_UPDATE}
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="mx-auto max-w-3xl px-6 py-14">
          <div className="article-content">

            <p>
              Ao acessar e utilizar o site <strong>litoralhaus.com.br</strong> e os serviços oferecidos pela
              <strong> Litoral Haus</strong> (CRECI-SP 267769-F), você concorda com os presentes Termos e
              Condições de Uso. Caso não concorde com qualquer disposição, recomendamos que não utilize o site.
            </p>

            <h2>1. Sobre a Litoral Haus</h2>
            <p>
              A Litoral Haus é uma empresa de intermediação imobiliária atuante no litoral de São Paulo,
              especializada em imóveis de médio e alto padrão nas regiões de Guarujá, Santos, Bertioga,
              São Vicente, Ubatuba, Ilhabela e São Sebastião. Somos devidamente registrados no CRECI-SP
              sob o nº 267769-F.
            </p>

            <h2>2. Uso do site</h2>
            <p>Ao utilizar este site, você se compromete a:</p>
            <ul>
              <li>Fornecer informações verdadeiras ao preencher formulários de contato ou cadastro.</li>
              <li>Não utilizar o site para fins ilícitos ou que violem direitos de terceiros.</li>
              <li>Não reproduzir, copiar ou redistribuir conteúdos sem autorização prévia e expressa.</li>
              <li>Não utilizar bots, scrapers ou qualquer mecanismo automatizado para coletar dados do site.</li>
            </ul>

            <h2>3. Informações sobre imóveis</h2>
            <p>
              As informações sobre imóveis disponibilizadas no site têm caráter meramente informativo e
              não constituem proposta firme de venda ou locação. Preços, disponibilidade e características
              estão sujeitos a alteração sem aviso prévio. Recomendamos sempre confirmar os dados com
              nossa equipe antes de tomar qualquer decisão.
            </p>
            <p>
              A Litoral Haus atua como intermediária entre compradores e vendedores/locadores, não sendo
              proprietária dos imóveis anunciados, salvo quando expressamente indicado.
            </p>

            <h2>4. Cadastro e leads</h2>
            <p>
              Ao preencher um formulário no site, você autoriza a Litoral Haus a entrar em contato por
              telefone, WhatsApp ou e-mail para apresentar imóveis e serviços compatíveis com seu perfil.
              Você pode solicitar a exclusão do seu cadastro a qualquer momento pelo e-mail{" "}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>

            <h2>5. Propriedade intelectual</h2>
            <p>
              Todo o conteúdo deste site — incluindo textos, fotografias, logotipo, layout e código-fonte
              — é de propriedade exclusiva da Litoral Haus ou de seus licenciadores, protegido pela
              legislação brasileira de propriedade intelectual (Lei nº 9.610/1998).
            </p>
            <p>
              É vedada a reprodução, total ou parcial, sem autorização prévia por escrito, exceto para
              uso pessoal e não comercial com atribuição à fonte.
            </p>

            <h2>6. Links externos</h2>
            <p>
              Este site pode conter links para sites de terceiros. A Litoral Haus não se responsabiliza
              pelo conteúdo, políticas de privacidade ou práticas de sites externos.
            </p>

            <h2>7. Limitação de responsabilidade</h2>
            <p>
              A Litoral Haus não se responsabiliza por:
            </p>
            <ul>
              <li>Erros ou omissões nas informações publicadas no site.</li>
              <li>Danos diretos ou indiretos decorrentes do uso ou da impossibilidade de uso do site.</li>
              <li>Indisponibilidade temporária do site por manutenção ou falhas técnicas.</li>
              <li>Decisões tomadas com base exclusivamente nas informações do site, sem consulta à nossa equipe.</li>
            </ul>

            <h2>8. Comissão e honorários</h2>
            <p>
              A intermediação imobiliária realizada pela Litoral Haus é remunerada por comissão, conforme
              tabela do CRECI-SP e acordos firmados entre as partes. Os honorários serão formalizados em
              proposta de prestação de serviços antes de qualquer compromisso financeiro.
            </p>

            <h2>9. Lei aplicável e foro</h2>
            <p>
              Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da Comarca de
              Guarujá — SP para dirimir quaisquer controvérsias decorrentes deste instrumento, com
              renúncia expressa a qualquer outro, por mais privilegiado que seja.
            </p>

            <h2>10. Alterações</h2>
            <p>
              A Litoral Haus reserva-se o direito de alterar estes Termos a qualquer momento. As
              alterações entram em vigor na data de publicação. O uso continuado do site após as
              alterações implica aceitação dos novos termos.
            </p>

            <h2>11. Contato</h2>
            <p>
              Dúvidas sobre estes Termos? Entre em contato:<br />
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>

          </div>

          <div className="mt-12 border-t border-gray-100 pt-8">
            <Link href="/" className="font-inter text-sm text-gray-400 transition-colors hover:text-gray-700">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
