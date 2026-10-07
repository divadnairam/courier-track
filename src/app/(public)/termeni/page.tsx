import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/shared/footer";

export const metadata = {
  title: "Termeni și Condiții — CourierTrack",
};

export default function TermeniConditii() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Package className="h-6 w-6 text-blue-300" />
            <span className="text-lg font-semibold">CourierTrack</span>
          </Link>
          <Link href="/" className="text-sm text-blue-200 hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Înapoi
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 prose prose-gray">
        <h1>Termeni și Condiții</h1>
        <p className="text-sm text-gray-500">Ultima actualizare: 6 octombrie 2026</p>

        <h2>1. Definiții</h2>
        <p>
          <strong>&quot;Platformă&quot;</strong> — site-ul web CourierTrack și serviciile asociate.<br />
          <strong>&quot;Operator&quot;</strong> — LunamerMMG, administratorul platformei.<br />
          <strong>&quot;Utilizator&quot;</strong> — orice persoană care accesează sau utilizează Platforma.<br />
          <strong>&quot;Client&quot;</strong> — utilizator cu cont înregistrat pe Platformă.
        </p>

        <h2>2. Obiectul serviciilor</h2>
        <p>
          CourierTrack oferă servicii de gestionare a transportului de colete și persoane pe rute
          naționale și internaționale. Platforma permite:
        </p>
        <ul>
          <li>Căutarea și rezervarea locurilor pe curse de transport persoane</li>
          <li>Urmărirea coletelor prin numărul AWB</li>
          <li>Gestionarea expedierilor pentru clienții înregistrați</li>
        </ul>

        <h2>3. Crearea contului</h2>
        <p>
          Pentru anumite funcționalități este necesară crearea unui cont. Utilizatorul este
          responsabil pentru confidențialitatea credențialelor de acces și pentru toate activitățile
          desfășurate prin contul său.
        </p>

        <h2>4. Rezervări și anulări</h2>
        <ul>
          <li>Rezervările sunt confirmate la momentul completării formularului și primirii unui cod de rezervare.</li>
          <li>Anularea este posibilă atâta timp cât cursa nu a plecat (status PROGRAMAT).</li>
          <li>Locurile anulate revin automat în disponibilitate.</li>
        </ul>

        <h2>5. Prețuri și plăți</h2>
        <p>
          Prețurile afișate pe Platformă sunt în EUR. Operatorul își rezervă dreptul de a modifica
          prețurile, modificarea aplicându-se doar rezervărilor viitoare.
        </p>

        <h2>6. Obligațiile utilizatorului</h2>
        <p>Utilizatorul se obligă:</p>
        <ul>
          <li>Să furnizeze date corecte și complete</li>
          <li>Să nu utilizeze Platforma în scopuri ilegale</li>
          <li>Să nu interfereze cu funcționarea Platformei</li>
          <li>Să respecte regulile de transport (greutate maximă colete, etc.)</li>
        </ul>

        <h2>7. Obligațiile operatorului</h2>
        <p>Operatorul se obligă:</p>
        <ul>
          <li>Să furnizeze serviciile cu diligență rezonabilă</li>
          <li>Să protejeze datele personale conform GDPR și legislației aplicabile</li>
          <li>Să informeze utilizatorii despre modificările semnificative ale serviciilor</li>
        </ul>

        <h2>8. Limitarea răspunderii</h2>
        <p>
          Operatorul nu răspunde pentru: întârzieri cauzate de condiții meteo sau de trafic,
          pierderea sau deteriorarea coletelor neconforme cu regulile de transport, sau
          indisponibilitatea temporară a Platformei din motive tehnice.
        </p>

        <h2>9. Protecția datelor personale</h2>
        <p>
          Prelucrarea datelor personale se face conform{" "}
          <Link href="/politica-confidentialitate" className="text-blue-600 hover:underline">
            Politicii de Confidențialitate
          </Link>, care face parte integrantă din acești Termeni.
        </p>

        <h2>10. Proprietate intelectuală</h2>
        <p>
          Conținutul Platformei (design, texte, logo-uri, cod sursă) este proprietatea
          Operatorului și este protejat de legislația privind drepturile de autor.
        </p>

        <h2>11. Modificarea termenilor</h2>
        <p>
          Operatorul poate modifica acești termeni în orice moment. Modificările intră în vigoare
          la data publicării pe Platformă. Continuarea utilizării Platformei după modificare
          constituie acceptarea noilor termeni.
        </p>

        <h2>12. Legea aplicabilă și jurisdicția</h2>
        <p>
          Acești termeni sunt guvernați de legislația din România. Orice litigiu va fi soluționat
          de instanțele competente din România.
        </p>

        <h2>13. Contact</h2>
        <p>
          Pentru întrebări sau reclamații: <strong>contact@couriertrack.ro</strong>
        </p>
      </main>

      <Footer />
    </div>
  );
}
