import { Card, CardContent, CardHeader, CardTitle } from '@clinica-saas/ui';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Clínica SaaS</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sistema de gestão para clínicas e consultórios em construção.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}