import { useEffect, useRef, useState } from 'react';

const STEPS = [
  { key: 'nome', ask: () => 'Para começar, qual é o seu nome?', type: 'text', ac: 'name', ph: 'Seu nome',
    valid: v => v.length >= 2, err: 'Pode me dizer seu nome?' },
  { key: 'telefone', ask: d => `Prazer, ${d.nome.split(' ')[0]}! Qual é o seu WhatsApp com DDD?`, type: 'tel', ac: 'tel', ph: '(21) 99999-9999',
    valid: v => v.replace(/\D/g, '').length >= 10, err: 'Esse número parece incompleto. Pode enviar com o DDD?' },
  { key: 'email', ask: () => 'E qual é o seu e-mail? Se preferir, pode pular.', type: 'email', ac: 'email', ph: 'seu@email.com', skip: true,
    valid: v => /^\S+@\S+\.\S+$/.test(v), err: 'Esse e-mail parece incorreto. Pode conferir?' },
  { key: 'modalidade', ask: () => 'Você prefere consulta presencial na Barra da Tijuca ou teleconsulta?', options: ['Presencial', 'Teleconsulta'] },
];

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
      await bot(`Perfeito, ${dados.current.nome.split(' ')[0]}! Recebi suas informações. Em breve nossa equipe entra em contato pelo WhatsApp para confirmar o melhor horário.`, id);
    } catch {
      if (await bot('Não consegui enviar suas informações agora. Verifique sua conexão e toque em "Tentar novamente".', id)) setFalhou(true);
    }
  };

  const iniciar = async () => {
    const id = ++run.current;
    dados.current = {}; setMsgs([]); setStep(-1); setValor(''); setFalhou(false);
    if (!(await bot('Olá! Sou a Dra. Danielle Hassene.', id))) return;
    if (!(await bot('Para dar sequência ao seu atendimento, preciso de algumas informações.', id))) return;
    perguntar(0, id);
  };

  const responder = (texto, guardado = texto) => {
    const s = STEPS[step];
    setMsgs(m => [...m, { de: 'eu', texto, hora: hora() }]);
    setValor('');
    if (s.valid && guardado && !s.valid(guardado)) { bot(s.err, run.current); return; }
    dados.current[s.key] = guardado;
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
        <img src="/images/v4/dra-recorte.png" alt="" width="40" height="40" />
        <div><b>Dra. Danielle Hassene</b><span>{typing ? 'digitando…' : 'online'}</span></div>
        <button type="button" aria-label="Fechar conversa" onClick={() => dlgRef.current.close()}>×</button>
      </header>
      <div className="wa__body" aria-live="polite">
        <p className="wa__day">Hoje</p>
        {msgs.map((m, i) => (
          <div key={i} className={`wa__msg wa__msg--${m.de}`}>{m.texto}<time>{m.hora}{m.de === 'eu' && <i aria-hidden="true">✓✓</i>}</time></div>
        ))}
        {typing && <div className="wa__msg wa__msg--bot wa__dots" aria-label="digitando"><span /><span /><span /></div>}
        {!typing && s?.options && <div className="wa__opts">{s.options.map(o => <button type="button" key={o} onClick={() => responder(o)}>{o}</button>)}</div>}
        {!typing && s?.skip && <div className="wa__opts"><button type="button" onClick={() => responder('Prefiro pular', '')}>Pular</button></div>}
        {!typing && falhou && <div className="wa__opts"><button type="button" onClick={() => perguntar(STEPS.length, run.current)}>Tentar novamente</button></div>}
        <div ref={fim} />
      </div>
      <form className="wa__bar" onSubmit={enviar}>
        <input ref={campo} type={s?.type || 'text'} autoComplete={s?.ac} value={valor} onChange={e => setValor(e.target.value)}
          placeholder={s?.type ? s.ph : 'Mensagem'} disabled={!s?.type || typing} aria-label="Sua resposta" />
        <button type="submit" aria-label="Enviar" disabled={!s?.type || typing || !valor.trim()}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
        </button>
      </form>
    </dialog>
  );
}
