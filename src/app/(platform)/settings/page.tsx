import { LanguageSelect } from "@/components/settings/language-select";
import { GlassCard } from "@/components/ui/glass-card";
import { ghostButtonClassName } from "@/components/ui/gradient-button";
import { getLocaleMessages } from "@/lib/locale";
import { getLocale } from "@/lib/locale-server";

export default async function SettingsPage() {
  const locale = await getLocale();
  const messages = getLocaleMessages(locale);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{messages.settings.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{messages.settings.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{messages.settings.description}</p>
      </div>

      <GlassCard>
        <div className="space-y-4">
          {messages.settings.notifications.map((setting) => (
            <label
              key={setting}
              className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/75"
            >
              <span className="[overflow-wrap:anywhere]">{setting}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-fuchsia-500" />
            </label>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">{messages.settings.difficultyTitle}</h2>
          <select className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            {messages.settings.difficultyOptions.map((option) => (
              <option key={option} className="bg-[#0f0c18]">
                {option}
              </option>
            ))}
          </select>
        </GlassCard>
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">{messages.settings.languageTitle}</h2>
          <LanguageSelect locale={locale} options={messages.settings.languageOptions} />
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex flex-wrap gap-4">
          <form action="/logout" method="post">
            <button type="submit" className={ghostButtonClassName}>
              {messages.settings.logout}
            </button>
          </form>
          <button
            disabled
            className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 opacity-60"
          >
            {messages.settings.deleteAccount}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
