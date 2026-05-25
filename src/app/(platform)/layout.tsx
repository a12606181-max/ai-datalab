import { AppLayout } from "@/components/layout/app-layout";
import { requireUser } from "@/lib/auth";
import { getLocale } from "@/lib/locale-server";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const locale = await getLocale();

  return (
    <AppLayout
      locale={locale}
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        avatarKey: user.avatarKey,
      }}
    >
      {children}
    </AppLayout>
  );
}
