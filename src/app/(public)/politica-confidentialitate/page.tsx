import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/shared/footer";

export const metadata = {
  title: "Politica de Confidențialitate — CourierTrack",
};

export default function PoliticaConfidentialitate() {
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
        <h1>Politica de Confidențialitate</h1>
        <p className="text-sm text-gray-500">Ultima actualizare: 6 octombrie 2026</p>

        <h2>1. Operatorul de date</h2>
        <p>
          Operatorul de date cu caracter personal este <strong>LunamerMMG</strong> (denumit în continuare
          &quot;CourierTrack&quot;, &quot;noi&quot; sau &quot;al nostru&quot;), care administrează platforma
          CourierTrack accesibilă la adresa acestui site web.
        </p>

        <h2>2. Date personale colectate</h2>
        <p>Colectăm și prelucrăm următoarele categorii de date personale:</p>
        <ul>
          <li><strong>Date de identificare:</strong> nume complet, adresă de email, număr de telefon</li>
          <li><strong>Date de cont:</strong> parola (stocată criptat/hash), rolul în sistem</li>
          <li><strong>Date de adresă:</strong> adresă, oraș, județ, țară</li>
          <li><strong>Date de rezervare:</strong> detalii cursă, destinație, număr locuri, detalii colete</li>
          <li><strong>Date de expediere:</strong> adrese de ridicare și livrare, greutate și dimensiuni colet</li>
          <li><strong>Date tehnice:</strong> adresa IP, tipul de browser (colectate automat prin cookie-uri)</li>
        </ul>

        <h2>3. Scopul prelucrării datelor</h2>
        <p>Prelucrăm datele dumneavoastră personale pentru:</p>
        <ul>
          <li>Furnizarea serviciilor de transport colete și persoane</li>
          <li>Crearea și gestionarea contului de utilizator</li>
          <li>Procesarea rezervărilor și urmărirea coletelor</li>
          <li>Comunicarea privind statusul rezervărilor și livrărilor</li>
          <li>Îmbunătățirea serviciilor noastre</li>
          <li>Conformitatea cu obligațiile legale</li>
        </ul>

        <h2>4. Temeiul juridic</h2>
        <p>Prelucrăm datele dumneavoastră pe baza:</p>
        <ul>
          <li><strong>Executarea contractului</strong> (Art. 6(1)(b) GDPR) — pentru furnizarea serviciilor solicitate</li>
          <li><strong>Consimțământul</strong> (Art. 6(1)(a) GDPR) — pentru cookie-uri non-esențiale și comunicări de marketing</li>
          <li><strong>Obligații legale</strong> (Art. 6(1)(c) GDPR) — pentru conformitatea cu legislația aplicabilă</li>
          <li><strong>Interes legitim</strong> (Art. 6(1)(f) GDPR) — pentru securitatea platformei și prevenirea fraudei</li>
        </ul>

        <h2>5. Perioada de stocare</h2>
        <p>
          Datele personale sunt stocate pe durata necesară îndeplinirii scopurilor pentru care au fost colectate.
          Datele contului sunt păstrate cât timp contul este activ. După ștergerea contului, datele sunt anonimizate
          sau șterse în termen de 30 de zile, cu excepția datelor necesare din motive legale (facturare, litigii),
          care pot fi păstrate până la 5 ani.
        </p>

        <h2>6. Drepturile dumneavoastră</h2>
        <p>În conformitate cu GDPR, aveți următoarele drepturi:</p>
        <ul>
          <li><strong>Dreptul de acces</strong> — puteți solicita o copie a datelor personale pe care le deținem despre dumneavoastră</li>
          <li><strong>Dreptul la rectificare</strong> — puteți corecta datele incorecte din secțiunea Profil</li>
          <li><strong>Dreptul la ștergere</strong> — puteți solicita ștergerea contului și a datelor asociate</li>
          <li><strong>Dreptul la portabilitatea datelor</strong> — puteți descărca datele dumneavoastră în format JSON</li>
          <li><strong>Dreptul la opoziție</strong> — vă puteți opune prelucrării datelor în anumite situații</li>
          <li><strong>Dreptul de a retrage consimțământul</strong> — în orice moment, fără a afecta legalitatea prelucrării anterioare</li>
        </ul>
        <p>
          Aceste drepturi pot fi exercitate din contul dumneavoastră (secțiunea Profil &gt; Confidențialitate)
          sau prin contactarea noastră la adresa de email indicată mai jos.
        </p>

        <h2>7. Cookie-uri</h2>
        <p>
          Utilizăm cookie-uri strict necesare pentru funcționarea platformei (autentificare, sesiune).
          Nu utilizăm cookie-uri de tracking sau publicitate. Fonturile sunt încărcate local, fără
          servicii terțe de tracking.
        </p>

        <h2>8. Transferuri internaționale</h2>
        <p>
          Datele dumneavoastră pot fi stocate pe servere situate în Uniunea Europeană sau în alte
          jurisdicții care asigură un nivel adecvat de protecție a datelor. Nu transferăm date
          personale către țări terțe fără garanții adecvate.
        </p>

        <h2>9. Securitatea datelor</h2>
        <p>
          Implementăm măsuri tehnice și organizatorice adecvate pentru protecția datelor personale,
          inclusiv: criptarea parolelor, conexiuni securizate (HTTPS), controlul accesului bazat pe
          roluri și monitorizarea accesului la date.
        </p>

        <h2>10. Divulgarea datelor către terți</h2>
        <p>
          Nu vindem, nu închiriem și nu distribuim datele dumneavoastră personale către terți în
          scopuri comerciale. Putem partaja date cu:
        </p>
        <ul>
          <li>Furnizori de servicii de hosting și infrastructură (pentru funcționarea platformei)</li>
          <li>Autorități publice, atunci când legea o impune</li>
        </ul>

        <h2>11. Modificări ale politicii</h2>
        <p>
          Ne rezervăm dreptul de a modifica această politică. Orice modificare va fi publicată pe
          această pagină cu data actualizării. Vă recomandăm să verificați periodic această pagină.
        </p>

        <h2>12. Contact</h2>
        <p>
          Pentru orice întrebări privind protecția datelor sau pentru exercitarea drepturilor
          dumneavoastră, ne puteți contacta la:
        </p>
        <ul>
          <li>Email: <strong>contact@couriertrack.ro</strong></li>
        </ul>

        <h2>13. Autoritatea de supraveghere</h2>
        <p>
          Dacă considerați că drepturile dumneavoastră au fost încălcate, aveți dreptul de a depune
          o plângere la <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu
          Caracter Personal (ANSPDCP)</strong>, B-dul G-ral. Gheorghe Magheru nr. 28-30, Sector 1,
          București, România, <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a>.
        </p>
      </main>

      <Footer />
    </div>
  );
}
