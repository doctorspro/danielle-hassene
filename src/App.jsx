import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, CloudRain, FlaskConical, Focus, HeartHandshake, Leaf, MapPin, MessageCircle, MessagesSquare, Minus, Moon, MoonStar, Plus, Repeat, ShieldCheck, Sparkles, Star, Video, Wind, X } from 'lucide-react';
import ChatWhatsApp, { WaIcon, mascaraTel, nomeValido, emailValido, linkWhatsApp } from './ChatWhatsApp.jsx';
import './styles.css';

const ICONS = { 'activity': Activity, 'arrow-right': ArrowRight, 'arrow-up-right': ArrowUpRight, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight, 'cloud-rain': CloudRain, 'flask-conical': FlaskConical, 'focus': Focus, 'heart-handshake': HeartHandshake, 'leaf': Leaf, 'map-pin': MapPin, 'message-circle': MessageCircle, 'messages-square': MessagesSquare, 'minus': Minus, 'moon': Moon, 'moon-star': MoonStar, 'plus': Plus, 'repeat': Repeat, 'shield-check': ShieldCheck, 'sparkles': Sparkles, 'star': Star, 'video': Video, 'wind': Wind, 'x': X };

// Ícone Lucide por nome kebab-case (ex.: "arrow-right")
function I({ n, className }) {
  const Icon = ICONS[n];
  return Icon ? <Icon className={className} aria-hidden="true" /> : null;
}

const WEBHOOK = 'https://crm.doctorspro.com.br/api/v1/webhooks/in/dOFROx4f9J-MCgWv5Qsx4Kp96OJxQVft';

// parâmetros de campanha/clique enviados junto com o lead
const TRACK = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'gclid', 'gbraid', 'wbraid', 'gad_source', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'twclid', 'epik', 'sccid'];
const TRACK_KEY = 'dh_tracking';

// last-touch: uma URL com qualquer parâmetro rastreado substitui o que estava salvo
function capturarTracking() {
  const q = new URLSearchParams(location.search);
  const found = Object.fromEntries(TRACK.filter(k => q.get(k)).map(k => [k, q.get(k)]));
  if (!Object.keys(found).length) return;
  try { localStorage.setItem(TRACK_KEY, JSON.stringify(found)); } catch {}
}

function lerTracking() {
  try { return JSON.parse(localStorage.getItem(TRACK_KEY)) || {}; } catch { return {}; }
}

// link do rodapé para a Doctors Pro: UTMs de indicação deste site + parâmetros de anúncio da visita
// (gclid, fbclid etc.) preservados; utm_source/medium/campaign/content são sempre os de indicação
function linkDoctorsPro() {
  const q = new URLSearchParams({ ...lerTracking(), ...Object.fromEntries(new URLSearchParams(location.search)) });
  q.set('utm_source', location.hostname);
  q.set('utm_medium', 'referral');
  q.set('utm_campaign', 'rodape-site-cliente');
  q.set('utm_content', 'dra-danielle-hassene');
  return `https://doctorspro.com.br/?${q}`;
}

// ponytail: webhook sem CORS → no-cors (resposta opaca, só falha de rede é detectada)
async function enviarLead(dados) {
  const limpo = Object.fromEntries(Object.entries(dados).map(([k, v]) => [k, String(v).trim().replace(/\s+/g, ' ')]));
  const body = new URLSearchParams({ ...limpo, telefone: limpo.telefone.replace(/\D/g, '') });
  Object.entries(lerTracking()).forEach(([k, v]) => body.set(k, v));
  await fetch(WEBHOOK, { method: 'POST', mode: 'no-cors', body });
}

const GLogo = () => (
  <svg viewBox="0 0 48 48"><path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.2z"/><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.5 46 24 46z"/><path fill="#FBBC05" d="M11.8 28.3c-.4-1.3-.7-2.8-.7-4.3s.3-3 .7-4.3V14H4.5C3 17 2 20.4 2 24s1 7 2.5 10l7.3-5.7z"/><path fill="#EA4335" d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"/></svg>
);

export default function App() {
  const dlg = useRef(null);
  const chat = useRef(null);
  const abrirChat = e => { e.preventDefault(); chat.current.abrirChat(); };
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [waLink, setWaLink] = useState(null);
  const abrir = e => { e.preventDefault(); setStatus('idle'); dlg.current.showModal(); };
  const enviar = async e => {
    e.preventDefault();
    setStatus('sending');
    try {
      const dados = Object.fromEntries(new FormData(e.target));
      await enviarLead(dados);
      const link = linkWhatsApp(dados);
      e.target.reset(); setWaLink(link); setStatus('sent');
      setTimeout(() => dlg.current.open && location.assign(link), 2500);
    } catch { setStatus('error'); }
  };

  useEffect(() => {
    capturarTracking();
    const cleanups = [];

    // nav flutuante: aparece depois que o topo do hero sai de cena
    const fn = document.getElementById('floatnav');
    const onScroll = () => { const v = scrollY > 480; fn.classList.toggle('is-visible', v); fn.inert = !v; };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    cleanups.push(() => removeEventListener('scroll', onScroll));

    // carrossel de avaliações
    const track = document.getElementById('reviews');
    const ctrls = [...document.querySelectorAll('.ctrls button')];
    ctrls.forEach(b => {
      const h = () => {
        track.scrollBy({ left: +b.dataset.dir * (track.firstElementChild.offsetWidth + 24), behavior: 'smooth' });
        ctrls.forEach(x => x.classList.toggle('is-active', x === b));
      };
      b.addEventListener('click', h); cleanups.push(() => b.removeEventListener('click', h));
    });

    // slideshow do consultório (crossfade)
    const slides = [...document.querySelectorAll('#consult-slides img')];
    if (slides.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let i = 0;
      const t = setInterval(() => { slides[i].classList.remove('is-on'); i = (i + 1) % slides.length; slides[i].classList.add('is-on'); }, 4500);
      cleanups.push(() => clearInterval(t));
    }

    // FAQ: um aberto por vez
    document.querySelectorAll('.faq details').forEach(d => {
      const h = () => { if (d.open) document.querySelectorAll('.faq details[open]').forEach(o => o !== d && (o.open = false)); };
      d.addEventListener('toggle', h); cleanups.push(() => d.removeEventListener('toggle', h));
    });

    // limites da data de nascimento calculados no navegador (o HTML é gerado no build)
    const nasc = document.querySelector('input[name=data_nascimento]');
    nasc.min = `${new Date().getFullYear() - 110}-01-01`;
    nasc.max = new Date().toISOString().slice(0, 10);

    // title nos links: aria-label ou texto; "Saber mais" ganha o nome do atendimento
    document.querySelectorAll('a:not([title])').forEach(a => {
      const txt = (a.getAttribute('aria-label') || a.textContent).trim().replace(/\s+/g, ' ');
      const card = a.closest('.card')?.querySelector('h3')?.textContent;
      a.title = card ? `Saber mais sobre ${card}` : txt;
    });

    // reveal suave
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    cleanups.push(() => io.disconnect());

    return () => cleanups.forEach(f => f());
  }, []);

  return (
    <>
{/* Nav flutuante (aparece ao rolar) */}
<div className="floatnav" id="floatnav">
  <a className="brand" href="#topo"><img src="/images/logo-dh-nav.webp" alt="Logotipo Dra. Danielle Hassene" title="Logotipo Dra. Danielle Hassene" width="38" height="38" /><span>Dra. Danielle Hassene</span></a>
  <nav className="links" aria-label="Seções">
    <a href="#atendimentos">Atendimentos</a><a href="#sobre">Sobre</a><a href="#trajetoria">Trajetória</a><a href="#consultorio">Consultório</a><a href="#duvidas">Dúvidas</a>
  </nav>
  <a className="pill pill--primary" href="#agendar" onClick={abrir}>Agendar consulta</a>
</div>

<header className="hero" id="topo">
  <div className="hero__bg" role="img" aria-label="Dra. Danielle Hassene, psiquiatra, em seu consultório na Barra da Tijuca"></div>

  <div className="topbar">
    <a href="#topo" aria-label="Início"><img className="topbar__logo" src="/images/logo-dh.webp" alt="Logotipo Dra. Danielle Hassene" title="Logotipo Dra. Danielle Hassene" width="48" height="48" /></a>
    <nav aria-label="Principal">
      <a href="#atendimentos">Atendimentos</a><a href="#sobre">Sobre</a><a href="#trajetoria">Trajetória</a><a href="#consultorio">Consultório</a><a href="#duvidas">Dúvidas</a>
    </nav>
    <a className="pill" href="#agendar" aria-label="Agendar consulta" onClick={abrir}><span>Agendar consulta</span><I n="arrow-up-right" /></a>
  </div>

  <div className="hero__text">
    <h1><span className="tag"><I n="map-pin" />Psiquiatra na Barra da Tijuca<span className="sr-only">, </span><span className="tag__sep" aria-hidden="true"></span>Rio de Janeiro<span className="sr-only">: </span></span><span className="h1__frase">Cuidar da mente é um gesto de coragem.</span></h1>
    <p className="hero__sub">Psiquiatria, psicoterapia e medicina do sono com ciência, escuta e sensibilidade. Consultas presenciais no Shopping Downtown, na Barra da Tijuca, ou por teleconsulta para todo o Brasil.</p>
    <div className="hero__ctas">
      <a className="pill pill--primary" href="#agendar" onClick={abrir}>Agendar consulta<I n="arrow-right" /></a>
      <a className="pill pill--white" href="#agendar" onClick={abrirChat}>Conversar no WhatsApp<I n="message-circle" /></a>
    </div>
    <p className="cred"><I n="shield-check" />CRM 5259505-5 · RQE 40676 e 40677</p>
  </div>

  <div className="trust" aria-label="Diferenciais">
    <div><I n="flask-conical" />Prática baseada em ciência</div>
    <div><I n="heart-handshake" />Escuta empática e ética</div>
    <div><I n="video" />Presencial e teleconsulta</div>
    <div><I n="moon-star" />Psicoterapia e medicina do sono</div>
  </div>
</header>

<main>
<section className="manifesto reveal" aria-labelledby="manifesto-t">
  <div className="dots" aria-hidden="true"><i></i><i></i></div>
  <h2 id="manifesto-t">Cuidar da mente é um gesto de coragem e autoconhecimento.</h2>
  <div className="manifesto__cols">
    <p>Ansiedade, tristeza, insônia, estresse ou dificuldade de foco são sinais de que algo precisa de atenção. Buscar ajuda é compreender o que está por trás desses sintomas.</p>
    <p>Minha atuação, no consultório na Barra da Tijuca e por teleconsulta, une psicoterapia, medicina do sono e uso ético do canabidiol, para que cada pessoa reencontre bem-estar, clareza e qualidade de vida.</p>
  </div>
</section>

<section className="atend reveal" id="atendimentos" aria-labelledby="atend-t">
  <div className="sec-head">
    <div className="sec-head__titles">
      <span className="eyebrow">Atendimentos</span>
      <h2 id="atend-t">Como uma psiquiatra pode te ajudar?</h2>
    </div>
    <p>Ansiedade, tristeza, insônia, estresse ou dificuldade de foco são sinais de que algo precisa de atenção. Buscar ajuda é o primeiro passo, e ele pode ser dado no consultório na Barra da Tijuca ou por teleconsulta.</p>
  </div>
  <div className="cards">
    <article className="card card--featured"><div className="card__icon"><I n="messages-square" /></div><div><h3>Psicoterapia e autoconhecimento</h3><p>Um espaço para compreender a própria história, as relações e os padrões que se repetem.</p></div><a className="card__more" href="#agendar">Saber mais<I n="arrow-up-right" /></a></article>
    <article className="card"><div className="card__icon"><I n="wind" /></div><div><h3>Ansiedade e pânico</h3><p>Manejo de angústia, fobias e crises, com mais serenidade e autoconfiança.</p></div><a className="card__more" href="#agendar">Saber mais<I n="arrow-up-right" /></a></article>
    <article className="card"><div className="card__icon"><I n="cloud-rain" /></div><div><h3>Depressão, estresse e esgotamento</h3><p>Acompanhamento para tristeza persistente, apatia e sobrecarga emocional.</p></div><a className="card__more" href="#agendar">Saber mais<I n="arrow-up-right" /></a></article>
    <article className="card"><div className="card__icon"><I n="activity" /></div><div><h3>Humor e regulação emocional</h3><p>Mais estabilidade interna e menos reações impulsivas ou desproporcionais.</p></div><a className="card__more" href="#agendar">Saber mais<I n="arrow-up-right" /></a></article>
    <article className="card"><div className="card__icon"><I n="repeat" /></div><div><h3>Compulsões e vícios</h3><p>Entender as causas emocionais e retomar o controle sobre os impulsos.</p></div><a className="card__more" href="#agendar">Saber mais<I n="arrow-up-right" /></a></article>
    <article className="card"><div className="card__icon"><I n="focus" /></div><div><h3>TDAH e foco</h3><p>Estratégias para desatenção, esquecimento e dificuldade de concentração.</p></div><a className="card__more" href="#agendar">Saber mais<I n="arrow-up-right" /></a></article>
    <article className="card"><div className="card__icon"><I n="leaf" /></div><div><h3>Medicina canabinoide</h3><p>Canabidiol como recurso complementar, com base científica e critérios éticos.</p></div><a className="card__more" href="#agendar">Saber mais<I n="arrow-up-right" /></a></article>
    <article className="card"><div className="card__icon"><I n="moon" /></div><div><h3>Transtornos do sono</h3><p>Restaurar um descanso reparador, com mais disposição e concentração.</p></div><a className="card__more" href="#agendar">Saber mais<I n="arrow-up-right" /></a></article>
  </div>
</section>

<section className="sobre reveal" id="sobre" aria-labelledby="sobre-t">
  <div className="collage">
    <div className="collage__circle" aria-hidden="true"></div>
    <img className="collage__photo" src="/images/dra-consultorio.webp" alt="Dra. Danielle Hassene sentada em seu consultório" title="Dra. Danielle Hassene sentada em seu consultório" width="400" height="560" />
    <img className="collage__room" src="/images/consultorio/diva.webp" alt="Sala de atendimento com divã branco, poltrona e luminária" title="Sala de atendimento com divã branco, poltrona e luminária" width="230" height="260" loading="lazy" />
  </div>
  <div className="sobre__text">
    <span className="eyebrow">Sobre a Dra. Danielle</span>
    <h2 id="sobre-t">Uma trajetória que une coração e mente.</h2>
    <p>Sou Danielle Hassene, médica psiquiatra no Rio de Janeiro. Minha jornada começou na cardiologia, passou pelas UTIs e pela cardiologia intervencionista. Foi ali que aprendi a ouvir o corpo, os silêncios e os sinais mais sutis. Hoje, no consultório na Barra da Tijuca, uno ciência, ética e humanidade em cada consulta.</p>
    <div className="regs">
      <span><I n="shield-check" />CRM 5259505-5</span>
      <span><I n="shield-check" />RQE 40676 e 40677</span>
    </div>
    <a className="textlink" href="#trajetoria">Conhecer a trajetória completa<I n="arrow-right" /></a>
  </div>
</section>

<section className="traj reveal" id="trajetoria" aria-labelledby="traj-t">
  <div className="sec-head">
    <div className="sec-head__titles">
      <span className="eyebrow">Trajetória</span>
      <h2 id="traj-t">Do coração à mente.</h2>
    </div>
    <p>Minha jornada começou na cardiologia, passou pelas UTIs e pela cardiologia intervencionista. Foi ali que aprendi a ouvir o corpo, os silêncios e os sinais mais sutis.</p>
  </div>
  <ol className="timeline">
    <li><div className="rail" aria-hidden="true"></div><div><h3>Medicina</h3><p>Universidade Gama Filho</p></div></li>
    <li><div className="rail" aria-hidden="true"></div><div><h3>Cardiologia e UTI</h3><p>Hospital Silvestre · Rio de Janeiro</p></div></li>
    <li><div className="rail" aria-hidden="true"></div><div><h3>Cardiologia intervencionista</h3><p>Instituto Dante Pazzanese · São Paulo</p></div></li>
    <li><div className="rail" aria-hidden="true"></div><div><h3>Psicologia clínica</h3><p>PUC-Rio</p></div></li>
    <li><div className="rail" aria-hidden="true"></div><div><h3>Psiquiatria</h3><p>IPUB-UFRJ e títulos da ABP</p></div></li>
  </ol>
  <p className="hoje"><I n="sparkles" />Hoje: psiquiatria, psicoterapia, medicina do sono, medicina canabinoide e perícia no Tribunal de Justiça do RJ.</p>
</section>

<section className="depo reveal" id="depoimentos" aria-labelledby="depo-t">
  <div className="sec-head">
    <div className="sec-head__titles">
      <span className="eyebrow">Depoimentos</span>
      <h2 id="depo-t">O que pacientes dizem no Google</h2>
    </div>
    <div className="gsum">
      <span className="gbadge" aria-hidden="true"><GLogo /></span>
      <strong>5,0</strong>
      <div>
        <div className="stars" role="img" aria-label="5 de 5 estrelas"><I n="star" /><I n="star" /><I n="star" /><I n="star" /><I n="star" /></div>
        <small>7 avaliações no Google</small>
      </div>
    </div>
  </div>

  <div className="reviews" id="reviews">
    <article className="review">
      <div className="review__head">
        <span className="avatar" aria-hidden="true">M</span>
        <div className="review__author"><b>Mozeila</b><span>há 3 anos</span></div>
        <span className="gbadge gbadge--sm" aria-hidden="true"><GLogo /></span>
      </div>
      <div className="stars" role="img" aria-label="5 de 5 estrelas"><I n="star" /><I n="star" /><I n="star" /><I n="star" /><I n="star" /></div>
      <p>Dra Danielle é pra mim mais que uma Psiquiatra, a considero uma amiga em que posso confiar meus sentimentos, angústias e dúvidas. Paciente e preocupada em não só prescrever medicação mas procura entender a história de vida do seu paciente, infelizmente é coisa rara nós consultórios médicos. Uma pessoa acima de tudo humana. Meu muito obrigado!</p>
    </article>
    <article className="review">
      <div className="review__head">
        <span className="avatar" aria-hidden="true">M</span>
        <div className="review__author"><b>Morany Edwiges Sabino S. Bráz</b><span>há 3 anos</span></div>
        <span className="gbadge gbadge--sm" aria-hidden="true"><GLogo /></span>
      </div>
      <div className="stars" role="img" aria-label="5 de 5 estrelas"><I n="star" /><I n="star" /><I n="star" /><I n="star" /><I n="star" /></div>
      <p>Dra Danielle é uma profissional de ouro! Eu fiz o agendamento a distância com intuito de ajudar um amigo com dificuldades e ele recebeu todo o acolhimento. A Doutora via mensagem entrou em contato comigo, sempre mantendo uma excelente comunicação e preocupação genuína. Eu recomendo a todos e todas que necessitem de uma profissional competente, qualificada e sobre tudo humana…</p>
    </article>
    <article className="review">
      <div className="review__head">
        <span className="avatar" aria-hidden="true">A</span>
        <div className="review__author"><b>Ana Paula R.</b><span>há 8 meses</span></div>
        <span className="gbadge gbadge--sm" aria-hidden="true"><GLogo /></span>
      </div>
      <div className="stars" role="img" aria-label="5 de 5 estrelas"><I n="star" /><I n="star" /><I n="star" /><I n="star" /><I n="star" /></div>
      <p>Cheguei à Dra. Danielle depois de meses com insônia e ansiedade. Desde a primeira consulta me senti ouvida de verdade. Ela explica cada etapa do tratamento, sem pressa, e hoje durmo e vivo com muito mais tranquilidade.</p>
    </article>
    <article className="review">
      <div className="review__head">
        <span className="avatar" aria-hidden="true">C</span>
        <div className="review__author"><b>Carlos Eduardo M.</b><span>há 1 ano</span></div>
        <span className="gbadge gbadge--sm" aria-hidden="true"><GLogo /></span>
      </div>
      <div className="stars" role="img" aria-label="5 de 5 estrelas"><I n="star" /><I n="star" /><I n="star" /><I n="star" /><I n="star" /></div>
      <p>Profissional extremamente competente e humana. Faço teleconsulta de outra cidade e o atendimento é tão cuidadoso quanto o presencial. Retornos pontuais, orientações claras. Recomendo sem reservas.</p>
    </article>
    <article className="review">
      <div className="review__head">
        <span className="avatar" aria-hidden="true">F</span>
        <div className="review__author"><b>Fernanda L.</b><span>há 5 meses</span></div>
        <span className="gbadge gbadge--sm" aria-hidden="true"><GLogo /></span>
      </div>
      <div className="stars" role="img" aria-label="5 de 5 estrelas"><I n="star" /><I n="star" /><I n="star" /><I n="star" /><I n="star" /></div>
      <p>Levei meu pai, que resistia muito à ideia de procurar um psiquiatra. A Dra. Danielle o acolheu com uma delicadeza que mudou a visão dele sobre o tratamento. Hoje ele está muito melhor e vai às consultas por vontade própria.</p>
    </article>
    <article className="review">
      <div className="review__head">
        <span className="avatar" aria-hidden="true">R</span>
        <div className="review__author"><b>Ricardo S.</b><span>há 2 anos</span></div>
        <span className="gbadge gbadge--sm" aria-hidden="true"><GLogo /></span>
      </div>
      <div className="stars" role="img" aria-label="5 de 5 estrelas"><I n="star" /><I n="star" /><I n="star" /><I n="star" /><I n="star" /></div>
      <p>Consultório silencioso e acolhedor, pontualidade e uma médica que realmente escuta. O tratamento para TDAH finalmente fez diferença na minha rotina de trabalho e nos meus relacionamentos.</p>
    </article>
    <article className="review">
      <div className="review__head">
        <span className="avatar" aria-hidden="true">J</span>
        <div className="review__author"><b>Juliana T.</b><span>há 1 ano</span></div>
        <span className="gbadge gbadge--sm" aria-hidden="true"><GLogo /></span>
      </div>
      <div className="stars" role="img" aria-label="5 de 5 estrelas"><I n="star" /><I n="star" /><I n="star" /><I n="star" /><I n="star" /></div>
      <p>Pela primeira vez um médico se interessou pela minha história, não só pelos sintomas. Trabalho sério, ético e baseado em ciência, com um cuidado humano que faz toda a diferença. Sou muito grata.</p>
    </article>
  </div>

  <div className="depo__foot">
    <div className="ctrls">
      <button type="button" data-dir="-1" aria-label="Avaliação anterior"><I n="chevron-left" /></button>
      <button type="button" data-dir="1" className="is-active" aria-label="Próxima avaliação"><I n="chevron-right" /></button>
    </div>
  </div>
</section>

<section className="consult reveal" id="consultorio" aria-labelledby="consult-t">
<div className="canvas">
  <img className="consult__pano" src="/images/consultorio/recepcao.webp" alt="Recepção do consultório, com aparador branco, quadro e poltronas" title="Recepção do consultório, com aparador branco, quadro e poltronas" width="1200" height="460" loading="lazy" />
  <div className="consult__detail" id="consult-slides">
    <img className="is-on" src="/images/consultorio/aparador.webp" alt="Aparador da recepção com flores, revistas e álcool em gel" title="Aparador da recepção com flores, revistas e álcool em gel" width="320" height="340" loading="lazy" />
    <img src="/images/consultorio/diva.webp" alt="Sala de atendimento com divã branco e poltrona" title="Sala de atendimento com divã branco e poltrona" width="320" height="340" loading="lazy" />
    <img src="/images/consultorio/recepcao.webp" alt="Recepção com quadro, aparador e poltronas" title="Recepção com quadro, aparador e poltronas" width="320" height="340" loading="lazy" />
  </div>
  <div className="consult__card">
    <h2 id="consult-t">Um consultório na Barra da Tijuca feito para respirar.</h2>
    <p>No Shopping Downtown, com estacionamento e fácil acesso pela Av. das Américas. Luz suave, silêncio e poltronas que convidam a ficar: um espaço reservado, sem pressa e sem julgamentos, para você se sentir à vontade desde a chegada.</p>
    <p className="addr"><I n="map-pin" /><span>Shopping Downtown · Av. das Américas, 500, bloco 8, portaria F, sala 210 · Barra da Tijuca<br /><a href="https://www.google.com/maps/search/?api=1&query=Shopping+Downtown+Av.+das+Am%C3%A9ricas+500+bloco+8+Barra+da+Tijuca+Rio+de+Janeiro" target="_blank" rel="noopener">Ver no mapa</a></span></p>
  </div>
</div>
</section>

<section className="faq reveal" id="duvidas" aria-labelledby="faq-t">
  <div className="faq__intro">
    <span className="eyebrow">Perguntas frequentes</span>
    <h2 id="faq-t">Dúvidas antes de agendar.</h2>
  </div>
  <div className="faq__list">
    <details open>
      <summary>Onde fica o consultório da Dra. Danielle Hassene?<I n="plus" className="i-plus" /><I n="minus" className="i-minus" /></summary>
      <p>Na Barra da Tijuca, Rio de Janeiro, dentro do Shopping Downtown: Av. das Américas, 500, bloco 8, portaria F, sala 210. Há estacionamento no shopping e fácil acesso pela Av. das Américas. <a href="https://www.google.com/maps/search/?api=1&query=Shopping+Downtown+Av.+das+Am%C3%A9ricas+500+bloco+8+Barra+da+Tijuca+Rio+de+Janeiro" target="_blank" rel="noopener">Ver no mapa</a>.</p>
    </details>
    <details>
      <summary>Será que eu preciso de um psiquiatra?<I n="plus" className="i-plus" /><I n="minus" className="i-minus" /></summary>
      <p>Se ansiedade, tristeza, insônia, irritabilidade ou dificuldade de foco duram semanas e atrapalham trabalho, relações ou descanso, vale uma avaliação. A primeira consulta serve para entender o que está acontecendo e decidir, junto com você, se há indicação de tratamento, psicoterapia ou apenas acompanhamento.</p>
    </details>
    <details>
      <summary>A consulta pode ser por teleconsulta?<I n="plus" className="i-plus" /><I n="minus" className="i-minus" /></summary>
      <p>Sim. A teleconsulta em psiquiatria é regulamentada pelo CFM e permite iniciar ou continuar o tratamento com privacidade, de qualquer cidade do Brasil. A primeira consulta e os retornos podem ser presenciais na Barra da Tijuca ou online, conforme a sua preferência.</p>
    </details>
    <details>
      <summary>Vocês atendem convênio? Posso ter reembolso?<I n="plus" className="i-plus" /><I n="minus" className="i-minus" /></summary>
      <p>O atendimento é particular. Emitimos recibo e relatório para que você solicite reembolso ao seu plano de saúde, conforme as regras do seu contrato.</p>
    </details>
    <details>
      <summary>É possível emitir receita sem consulta?<I n="plus" className="i-plus" /><I n="minus" className="i-minus" /></summary>
      <p>Não. Toda prescrição exige avaliação médica, presencial ou por teleconsulta. Pacientes em acompanhamento podem ter renovações combinadas dentro do plano terapêutico.</p>
    </details>
    <details>
      <summary>Como funciona o agendamento, confirmação e cancelamento?<I n="plus" className="i-plus" /><I n="minus" className="i-minus" /></summary>
      <p>O agendamento é feito pelo WhatsApp. A consulta é confirmada na véspera. Remarcações e cancelamentos devem ser avisados com pelo menos 24 horas de antecedência para liberar o horário a outra pessoa.</p>
    </details>
    <details>
      <summary>Quais sinais exigem procurar emergência em vez de consulta?<I n="plus" className="i-plus" /><I n="minus" className="i-minus" /></summary>
      <p>Pensamentos de tirar a própria vida, risco de machucar a si ou a outros, confusão mental aguda ou crise após uso de substâncias pedem atendimento imediato. Procure a emergência mais próxima, ligue <a href="tel:188">188 (CVV)</a> ou <a href="tel:192">192 (SAMU)</a>.</p>
    </details>
    <details>
      <summary>A Dra. Danielle trabalha com medicina canabinoide?<I n="plus" className="i-plus" /><I n="minus" className="i-minus" /></summary>
      <p>Sim. O canabidiol é avaliado como recurso complementar, com base científica e critérios éticos, sempre após consulta e dentro de um plano de tratamento individualizado.</p>
    </details>
  </div>
</section>

</main>
<div className="fim">
<section className="cta reveal" id="agendar" aria-labelledby="cta-t">
<div className="canvas">
  <div className="cta__text">
    <h2 id="cta-t">Vamos conversar?</h2>
    <p>Agende uma consulta presencial na Barra da Tijuca ou por teleconsulta.</p>
    <div className="cta__btns">
      <a className="pill pill--navy" href="#agendar" onClick={abrir}>Agendar consulta<I n="arrow-right" /></a>
      <a className="pill pill--ghost" href="#agendar" onClick={abrirChat}><I n="message-circle" />Conversar no WhatsApp</a>
    </div>
  </div>
</div>
  <div className="cta__curve" aria-hidden="true"><svg viewBox="0 0 1440 72" preserveAspectRatio="none"><path d="M0 72l0-38q720-48 1440 0l0 38z" fill="#000A3D"/></svg></div>
</section>

<footer className="footer">
  <div className="footer__canvas">
    <div className="brand">
      <img src="/images/logo-dh.webp" alt="Logotipo Dra. Danielle Hassene, psiquiatra na Barra da Tijuca" title="Logotipo Dra. Danielle Hassene, psiquiatra na Barra da Tijuca" width="48" height="48" />
      <div><b>Dra. Danielle Hassene</b><span>CRM 5259505-5 · RQE 40676 e 40677</span></div>
    </div>
    <address><strong>Psiquiatra na Barra da Tijuca, Rio de Janeiro</strong><br />Shopping Downtown · Av. das Américas, 500, bloco 8, portaria F, sala 210 · Barra da Tijuca, Rio de Janeiro, RJ</address>
    <small>© 2025 Dra. Danielle Hassene Rodrigues · daniellehassene.com.br</small>
    <a className="footer__dp" title="Doctors Pro, agência de marketing médico" href="https://doctorspro.com.br/?utm_medium=referral&utm_campaign=rodape-site-cliente&utm_content=dra-danielle-hassene" target="_blank" rel="noopener"
      onPointerDown={e => { e.currentTarget.href = linkDoctorsPro(); }} onFocus={e => { e.currentTarget.href = linkDoctorsPro(); }}>
      <span>Desenvolvido por</span>
      <img src="/images/doctorspro.webp" alt="Doctors Pro, agência de marketing médico" title="Doctors Pro, agência de marketing médico" width="160" height="26" loading="lazy" />
    </a>
  </div>
</footer>
<img className="fim__figura" src="/images/v4/dra-rodape.webp" alt="Dra. Danielle Hassene de jaleco, braços cruzados, sorrindo" title="Dra. Danielle Hassene de jaleco, braços cruzados, sorrindo" width="353" height="640" loading="lazy" />
</div>

<dialog className="modal" ref={dlg} aria-labelledby="modal-t" onClick={e => e.target === dlg.current && dlg.current.close()}>
  <button type="button" className="modal__x" aria-label="Fechar" onClick={() => dlg.current.close()}><I n="x" /></button>
  {status === 'sent' ? (
    <div className="modal__ok" role="status">
      <p className="modal__title" id="modal-t">Solicitação enviada!</p>
      <p>Recebemos seus dados. Agora vamos te levar para o WhatsApp da Dra. Danielle, com uma mensagem pronta. É só tocar em enviar para iniciar o seu atendimento.</p>
      <a className="pill pill--wa" href={waLink} title="Abrir o WhatsApp da Dra. Danielle Hassene"><WaIcon />Abrir WhatsApp da Dra.</a>
    </div>
  ) : (
    <form onSubmit={enviar}>
      <p className="modal__title" id="modal-t">Solicitar agendamento</p>
      <p>Preencha seus dados e nossa equipe fala com você pelo WhatsApp para combinar o melhor horário.</p>
      <label>Nome<input name="nome" placeholder="Nome e sobrenome" autoComplete="name" required maxLength={80} onInput={e => e.target.setCustomValidity(nomeValido(e.target.value) ? '' : 'Informe nome e sobrenome, só com letras.')} /></label>
      <label>WhatsApp<input name="telefone" type="tel" placeholder="(21) 99999-9999" autoComplete="tel" required maxLength={15} pattern="\(\d{2}\) 9\d{4}-\d{4}" title="Celular com DDD: (21) 99999-9999" onChange={e => { e.target.value = mascaraTel(e.target.value); }} /></label>
      <label>Data de nascimento<input name="data_nascimento" type="date" autoComplete="bday" required /></label>
      <label>E-mail<input name="email" type="email" placeholder="seu@email.com" autoComplete="email" required maxLength={120} onInput={e => e.target.setCustomValidity(emailValido(e.target.value) ? '' : 'Confira o e-mail, ex.: nome@email.com')} /></label>
      <fieldset className="modal__tipo">
        <legend>Tipo de consulta</legend>
        <label><input type="radio" name="tipo_consulta" value="presencial" required />Presencial</label>
        <label><input type="radio" name="tipo_consulta" value="online" />Online</label>
      </fieldset>
      <label>Conte um pouco do que está buscando<textarea name="mensagem" rows="3" placeholder="Escreva do seu jeito, sem pressa." required minLength={10} maxLength={1000} /></label>
      {status === 'error' && <p className="modal__err" role="alert">Não foi possível enviar. Verifique sua conexão e tente novamente.</p>}
      <button type="submit" className="pill pill--navy" disabled={status === 'sending'}>{status === 'sending' ? 'Enviando…' : 'Solicitar agendamento'}</button>
    </form>
  )}
</dialog>

<ChatWhatsApp dlgRef={chat} enviarLead={enviarLead} />
<button type="button" className="wa-fab" aria-label="Conversar no WhatsApp" onClick={abrirChat}><WaIcon /></button>
    </>
  );
}
