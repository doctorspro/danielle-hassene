import { useEffect, useRef, useState } from 'react';

const WHATSAPP_DRA = '552124924187';

// mensagem pronta para a pessoa iniciar a conversa com a Dra. no WhatsApp
export function linkWhatsApp(d) {
  const tipo = d.tipo_consulta === 'online' ? 'online' : 'presencial';
  const texto = `Olá, Dra. Danielle! Sou ${d.nome.trim().replace(/\s+/g, ' ')} e acabei de preencher o formulário no site. Gostaria de agendar uma consulta ${tipo}.\n\nO que estou buscando: ${d.mensagem.trim()}`;
  return `https://wa.me/${WHATSAPP_DRA}?text=${encodeURIComponent(texto)}`;
}

const primeiro = d => d.nome.split(' ')[0];

const STEPS = [
  { key: 'nome', ask: () => 'Para começar, qual é o seu nome completo?', type: 'text', ac: 'name', ph: 'Nome e sobrenome', max: 80,
    valid: nomeValido, err: 'Preciso do seu nome e sobrenome, só com letras. Pode enviar de novo?' },
  { key: 'telefone', ask: d => `Prazer, ${primeiro(d)}! Qual é o seu WhatsApp com DDD? É por ele que vamos confirmar seu horário.`,
    type: 'tel', ac: 'tel', ph: '(21) 99999-9999', mask: mascaraTel,
    valid: v => /^\(\d{2}\) 9\d{4}-\d{4}$/.test(v), err: 'Esse número parece incompleto. Pode enviar o celular com DDD?' },
  { key: 'data_nascimento', ask: () => 'Qual é a sua data de nascimento?', type: 'text', ac: 'bday', ph: 'DD/MM/AAAA', mode: 'numeric', mask: mascaraData,
    parse: nascimento, err: 'Não reconheci essa data. Pode enviar no formato DD/MM/AAAA?' },
  { key: 'email', ask: () => 'Qual é o seu melhor e-mail?', type: 'email', ac: 'email', ph: 'seu@email.com', max: 120,
    valid: emailValido, err: 'Esse e-mail parece incorreto. Pode conferir?' },
  { key: 'tipo_consulta', ask: () => 'Você prefere consulta presencial, na Barra da Tijuca, ou online?',
    options: [['Presencial', 'presencial'], ['Online', 'online']] },
  { key: 'mensagem', ask: () => 'Para finalizar, conte-me um pouco do que está buscando. Pode escrever do seu jeito, sem pressa.',
    type: 'text', ph: 'Escreva aqui…', max: 1000,
    valid: v => v.length >= 10, err: 'Pode me contar um pouco mais? Isso me ajuda a preparar o seu atendimento.' },
];

// "23/04/1985" → "1985-04-23"; null se a data não existir ou estiver fora do intervalo
function nascimento(v) {
  const m = v.match(/^(\d{1,2})\D+(\d{1,2})\D+(\d{4})$/);
  if (!m) return null;
  const [, d, mes, a] = m.map(Number);
  const dt = new Date(Date.UTC(a, mes - 1, d));
  if (dt.getUTCDate() !== d || dt.getUTCMonth() !== mes - 1 || dt > new Date() || new Date().getUTCFullYear() - a > 110) return null;
  return dt.toISOString().slice(0, 10);
}

// nome e sobrenome: só letras (com acento), apóstrofo ou hífen; primeiro e último com 2+ letras
export function nomeValido(v) {
  const p = v.trim().split(/\s+/);
  return p.length >= 2 && p.every(x => /^\p{L}[\p{L}'’-]*$/u.test(x)) && p[0].length >= 2 && p.at(-1).length >= 2;
}

export function emailValido(v) {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i.test(v.trim());
}

// DD/MM/AAAA, só dígitos
export function mascaraData(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join('/');
}

// celular BR: (21) 99999-8888, no máximo 11 dígitos
export function mascaraTel(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const hora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const espera = ms => new Promise(r => setTimeout(r, ms));

export const WaIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.44-5.03c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.89.99 6.67 2.77a9.37 9.37 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44zm8.04-17.48A11.3 11.3 0 0 0 12.04.7C5.77.7.67 5.8.67 12.06c0 2 .52 3.96 1.52 5.68L.57 23.7l6.1-1.6a11.33 11.33 0 0 0 5.37 1.37h.01c6.26 0 11.36-5.1 11.37-11.36a11.3 11.3 0 0 0-3.34-8.04z"/></svg>
);

export default function ChatWhatsApp({ dlgRef, enviarLead }) {
  const [msgs, setMsgs] = useState([]);
  const [step, setStep] = useState(-1); // -1 abertura · STEPS.length enviando/fim
  const [typing, setTyping] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const [wa, setWa] = useState(null); // link final para o WhatsApp da Dra.
  const [valor, setValor] = useState('');
  const dados = useRef({});
  const run = useRef(0); // invalida conversas antigas ao reabrir
  const fim = useRef(null);
  const campo = useRef(null);

  const bot = async (texto, id) => {
    setTyping(true);
    await espera(700 + Math.min(texto.length * 12, 900));
    if (id !== run.current) return false;
    setTyping(false);
    setMsgs(m => [...m, { de: 'bot', texto, hora: hora() }]);
    return true;
  };

  const perguntar = async (i, id) => {
    if (i < STEPS.length) { if (await bot(STEPS[i].ask(dados.current), id)) setStep(i); return; }
    setStep(STEPS.length); setFalhou(false);
    try {
      await enviarLead(dados.current);
      if (!(await bot(`Obrigada, ${primeiro(dados.current)}! Recebi suas informações.`, id))) return;
      if (!(await bot('Agora vou te levar para o meu WhatsApp, com uma mensagem pronta. É só tocar em enviar para iniciarmos o seu atendimento.', id))) return;
      const link = linkWhatsApp(dados.current);
      setWa(link);
      await espera(2500);
      if (id === run.current) location.assign(link);
    } catch {
      if (await bot('Não consegui enviar suas informações agora. Verifique sua conexão e toque em "Tentar novamente".', id)) setFalhou(true);
    }
  };

  const iniciar = async () => {
    const id = ++run.current;
    dados.current = {}; setMsgs([]); setStep(-1); setValor(''); setFalhou(false); setWa(null);
    if (!(await bot('Olá! Sou a Dra. Danielle Hassene. Que bom ter você por aqui.', id))) return;
    if (!(await bot('Para dar sequência ao seu atendimento, preciso de algumas informações. Leva só um minutinho.', id))) return;
    perguntar(0, id);
  };

  const responder = (texto, guardado = texto) => {
    const s = STEPS[step];
    setMsgs(m => [...m, { de: 'eu', texto, hora: hora() }]);
    setValor('');
    const v = s.parse ? s.parse(guardado) : guardado;
    if (v === null || (s.valid && !s.valid(v))) { bot(s.err, run.current); return; }
    dados.current[s.key] = v;
    setStep(-1);
    perguntar(step + 1, run.current);
  };

  // expõe a abertura para os botões da página
  useEffect(() => {
    const d = dlgRef.current;
    d.abrirChat = () => { d.showModal(); iniciar(); };
    const fechar = () => { run.current++; setTyping(false); };
    d.addEventListener('close', fechar);
    return () => d.removeEventListener('close', fechar);
  }, []);

  useEffect(() => { fim.current?.scrollIntoView({ block: 'end' }); }, [msgs, typing, step]);
  useEffect(() => { if (STEPS[step]?.type) campo.current?.focus(); }, [step]);

  const s = STEPS[step];
  const enviar = e => { e.preventDefault(); const v = valor.trim(); if (v) responder(v); };

  return (
    <dialog className="wa" ref={dlgRef} aria-label="Conversa no WhatsApp com a Dra. Danielle Hassene" onClick={e => e.target === dlgRef.current && dlgRef.current.close()}>
      <header className="wa__top">
        <img src="/images/dra-avatar.webp" alt="Dra. Danielle Hassene" title="Dra. Danielle Hassene" width="40" height="40" />
        <div><b>Dra. Danielle Hassene</b><span>{typing ? 'digitando…' : 'online'}</span></div>
        <button type="button" aria-label="Fechar conversa" onClick={() => dlgRef.current.close()}>×</button>
      </header>
      <div className="wa__body" aria-live="polite">
        <p className="wa__day">Hoje</p>
        {msgs.map((m, i) => (
          <div key={i} className={`wa__msg wa__msg--${m.de}`}>{m.texto}<time>{m.hora}{m.de === 'eu' && <i aria-hidden="true">✓✓</i>}</time></div>
        ))}
        {typing && <div className="wa__msg wa__msg--bot wa__dots" aria-label="digitando"><span /><span /><span /></div>}
        {!typing && s?.options && <div className="wa__opts">{s.options.map(([rotulo, v]) => <button type="button" key={v} onClick={() => responder(rotulo, v)}>{rotulo}</button>)}</div>}
        {!typing && falhou && <div className="wa__opts"><button type="button" onClick={() => perguntar(STEPS.length, run.current)}>Tentar novamente</button></div>}
        {!typing && wa && <div className="wa__opts"><a className="wa__go" href={wa} title="Abrir o WhatsApp da Dra. Danielle Hassene">Abrir WhatsApp da Dra.</a></div>}
        <div ref={fim} />
      </div>
      <form className="wa__bar" onSubmit={enviar}>
        <input ref={campo} type={s?.type || 'text'} autoComplete={s?.ac} inputMode={s?.mode} maxLength={s?.max} value={valor} onChange={e => setValor((s?.mask || (x => x))(e.target.value))}
          placeholder={s?.type ? s.ph : 'Mensagem'} disabled={!s?.type || typing} aria-label="Sua resposta" />
        <button type="submit" aria-label="Enviar" disabled={!s?.type || typing || !valor.trim()}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
        </button>
      </form>
    </dialog>
  );
}
