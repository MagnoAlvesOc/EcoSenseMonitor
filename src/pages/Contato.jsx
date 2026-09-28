import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, ArrowLeft, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTACT_EMAIL = "jose.mpa@discente.ufma.br";

export default function Contato() {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contato — EcoSense Monitor (${form.nome})`);
    const body = encodeURIComponent(`${form.mensagem}\n\n— ${form.nome} (${form.email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setEnviado(true);
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-xl px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar ao app
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">EcoSense Monitor</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Contato</h1>
        <p className="text-muted-foreground mb-8">
          Fale com a equipe da EcoSense Monitor sobre as estações, os dados ou a plataforma.
        </p>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 mb-8 hover:border-primary/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail</p>
            <p className="font-semibold">{CONTACT_EMAIL}</p>
          </div>
        </a>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={form.nome} onChange={set("nome")} placeholder="Seu nome" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="voce@exemplo.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea id="mensagem" value={form.mensagem} onChange={set("mensagem")} rows={5} placeholder="Como podemos ajudar?" required />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            <Send className="w-4 h-4 mr-2" /> Enviar mensagem
          </Button>
          {enviado && (
            <p className="text-sm text-muted-foreground">
              Seu aplicativo de e-mail foi aberto com a mensagem pronta — basta enviar.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}