import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Saiba como a Litoral Haus coleta, usa e protege seus dados pessoais de acordo com a LGPD.",
  robots: { index: true, follow: true },
};

const LAST_UPDATE = "20 de junho de 2026";
const EMAIL = "contato@litoralhaus.com.br";
const WA = "https://wa.me/5513955422935";

export default function PrivacidadePage() {
  return (
    <>
      <Navbar />

      <main className="bg-white">
        {/* Hero */}
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-14">
          <div className="mx-auto max-w-3xl">
            <p className="font-inter text-xs uppercase tracking-widest text-amber-600">Legal</p>
            <h1 className="mt-2 font-cormorant text-4xl font-semibold text-gray-900">
              Política de Privacidade
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
              A <strong>Litoral Haus</strong> (&quot;nós&quot;, &quot;nossa&quot; ou &quot;Empresa&quot;), inscrita no CRECI-SP sob o nº 267769-F,
              tem o compromisso de proteger a privacidade e os dados pessoais de seus clientes, visitantes e
              parceiros. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos
              suas informações, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
            </p>

            <h2>1. Dados que coletamos</h2>
            <p>Coletamos as seguintes categorias de dados pessoais:</p>
            <ul>
              <li><strong>Identificação:</strong> nome completo, e-mail, telefone e WhatsApp.</li>
              <li><strong>Preferências imobiliárias:</strong> tipo de imóvel, faixa de orçamento, regiões de interesse.</li>
              <li><strong>Navegação:</strong> endereço IP, páginas visitadas, tempo de sessão (via Google Analytics).</li>
              <li><strong>Comunicação:</strong> mensagens enviadas pelo formulário de contato ou WhatsApp.</li>
              <li><strong>Origem:</strong> parâmetros UTM (utm_source, utm_medium, utm_campaign) para rastrear a origem do acesso.</li>
            </ul>

            <h2>2. Como coletamos seus dados</h2>
            <ul>
              <li>Formulários de contato e captação de leads no site.</li>
              <li>Conversas iniciadas via WhatsApp ou Instagram.</li>
              <li>Cookies e tecnologias de rastreamento (Google Analytics 4).</li>
              <li>Interações diretas com nossa equipe (presencial, telefone, e-mail).</li>
            </ul>

            <h2>3. Finalidade do tratamento</h2>
            <p>Utilizamos seus dados para:</p>
            <ul>
              <li>Entrar em contato para apresentar imóveis compatíveis com seu perfil.</li>
              <li>Agendar visitas e negociações.</li>
              <li>Enviar informações relevantes sobre o mercado imobiliário (somente com consentimento).</li>
              <li>Melhorar a experiência de navegação no site.</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>

            <h2>4. Base legal</h2>
            <p>
              O tratamento dos seus dados se baseia nas seguintes hipóteses legais previstas na LGPD:
            </p>
            <ul>
              <li><strong>Consentimento</strong> (art. 7º, I) — para envio de comunicações de marketing.</li>
              <li><strong>Execução de contrato</strong> (art. 7º, V) — para intermediação imobiliária.</li>
              <li><strong>Legítimo interesse</strong> (art. 7º, IX) — para atendimento a leads que nos contataram voluntariamente.</li>
              <li><strong>Cumprimento de obrigação legal</strong> (art. 7º, II) — quando exigido por lei.</li>
            </ul>

            <h2>5. Compartilhamento de dados</h2>
            <p>
              Não vendemos seus dados pessoais. Podemos compartilhá-los apenas com:
            </p>
            <ul>
              <li>Proprietários de imóveis, para fins de negociação — somente com sua ciência.</li>
              <li>Prestadores de serviços tecnológicos (ex.: Cloudinary para imagens, Vercel para hospedagem) que
              atuam como operadores sob nossas instruções.</li>
              <li>Autoridades públicas, quando exigido por lei.</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              Utilizamos o Google Analytics 4 para análise de tráfego. Os dados coletados são anonimizados e
              usados apenas para fins estatísticos e de melhoria do site. Você pode desativar cookies nas
              configurações do seu navegador.
            </p>

            <h2>7. Prazo de retenção</h2>
            <p>
              Seus dados são mantidos pelo tempo necessário para cumprir as finalidades descritas nesta política
              ou pelo prazo exigido por lei. Leads não convertidos têm seus dados excluídos após 2 (dois) anos
              de inatividade.
            </p>

            <h2>8. Seus direitos</h2>
            <p>Nos termos da LGPD, você tem direito a:</p>
            <ul>
              <li>Confirmar a existência de tratamento de seus dados.</li>
              <li>Acessar seus dados pessoais que mantemos.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
              <li>Solicitar a portabilidade dos seus dados.</li>
            </ul>
            <p>
              Para exercer seus direitos, entre em contato pelo e-mail{" "}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ou pelo{" "}
              <a href={WA} target="_blank" rel="noopener noreferrer">WhatsApp</a>.
              Responderemos em até 15 (quinze) dias úteis.
            </p>

            <h2>9. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado,
              perda ou destruição, incluindo criptografia em trânsito (HTTPS) e controle de acesso restrito ao
              nosso sistema interno.
            </p>

            <h2>10. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. A data da última atualização é indicada no topo
              desta página. Alterações relevantes serão comunicadas por e-mail aos cadastrados.
            </p>

            <h2>11. Contato</h2>
            <p>
              <strong>Litoral Haus</strong> — Encarregado de Proteção de Dados (DPO)<br />
              E-mail: <a href={`mailto:${EMAIL}`}>{EMAIL}</a><br />
              WhatsApp: <a href={WA} target="_blank" rel="noopener noreferrer">(13) 95542-2935</a>
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
