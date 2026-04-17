# E-Mail System & LemFi Payment Integration

## Überblick

Das E-Mail-System wurde erfolgreich implementiert und ist voll funktionsfähig. Es sendet automatisch E-Mails bei verschiedenen Bestellstatus-Änderungen.

---

## ✅ Was wurde implementiert

### 1. E-Mail Service (Edge Function)
**Endpoint:** `https://[YOUR-SUPABASE-URL]/functions/v1/send-order-email`

**Funktionen:**
- ✉️ Bestellbestätigung mit Zahlungsdetails
- 💰 Zahlungsbestätigung
- 🚢 Versandbenachrichtigung
- 📦 Lieferbestätigung

**Sprachen:** Deutsch (DE), Französisch (FR), Lingala (LN)

### 2. LemFi Webhook (Edge Function)
**Endpoint:** `https://[YOUR-SUPABASE-URL]/functions/v1/lemfi-webhook`

**Funktionen:**
- Empfängt LemFi Zahlungsbenachrichtigungen
- Aktualisiert automatisch den Zahlungsstatus
- Speichert Transaktionen in `payment_transactions` Tabelle
- Sendet automatisch Zahlungsbestätigungs-E-Mail

### 3. Datenbank-Tabellen

**payment_transactions:**
- Speichert alle Zahlungstransaktionen
- Verknüpft mit Bestellungen
- Enthält vollständige Provider-Response

**Neue Felder in orders Tabelle:**
- `email_sent` - Zeigt an, ob Bestätigungs-E-Mail gesendet wurde
- `payment_confirmed_at` - Zeitstempel der Zahlungsbestätigung

---

## 📧 E-Mail Templates

### 1. Bestellbestätigung (order_confirmation)
**Wird gesendet:** Sofort nach Bestellung

**Inhalt:**
- Bestellnummer
- Bestellte Produkte
- Gesamtbetrag
- **LemFi Zahlungsinformationen:**
  - Empfänger: GermanLink Business GmbH
  - IBAN: DE89 3704 0044 0532 0130 00
  - Verwendungszweck: [Bestellnummer]
  - Betrag
- Versanddatum

### 2. Zahlungsbestätigung (payment_confirmed)
**Wird gesendet:** Wenn LemFi Zahlung bestätigt

**Inhalt:**
- Bestätigung des Zahlungseingangs
- Betrag
- Nächste Schritte

### 3. Versandbenachrichtigung (order_shipped)
**Wird gesendet:** Wenn Admin Status auf 'shipped' setzt

**Inhalt:**
- Versanddatum
- Tracking-Informationen
- Voraussichtliche Ankunft (4-8 Wochen)

### 4. Lieferbestätigung (order_delivered)
**Wird gesendet:** Wenn Admin Status auf 'delivered' setzt

**Inhalt:**
- Lieferbestätigung
- Danke-Nachricht
- Aufforderung zur Bewertung

---

## 🔧 Wie funktioniert die Zahlungsverifizierung?

### Option A: Manuell (Aktuell aktiv)

1. **Kunde bestellt:**
   - Bestellung wird erstellt mit Status `payment_status: 'pending'`
   - E-Mail mit Zahlungsdetails wird automatisch gesendet

2. **Kunde überweist via LemFi:**
   - Verwendet die Bestellnummer als Referenz
   - Überweist auf das angegebene IBAN-Konto

3. **Admin prüft LemFi-Konto:**
   - Sieht Zahlung mit Referenz-Nummer (z.B. `CEE-123456`)
   - Öffnet Admin-Dashboard → Order Management
   - Findet die Bestellung anhand der Referenz
   - Ändert Status: `pending` → `paid`

4. **System reagiert automatisch:**
   - Status-Änderung wird gespeichert
   - E-Mail-Benachrichtigung wird automatisch gesendet

### Option B: Semi-Automatisch (Vorbereitet)

**LemFi Webhook Integration:**

1. **Webhook in LemFi konfigurieren:**
   - URL: `https://[YOUR-SUPABASE-URL]/functions/v1/lemfi-webhook`
   - Events: `payment.success`, `payment.failed`

2. **Automatischer Ablauf:**
   - LemFi sendet Webhook bei Zahlungseingang
   - System prüft Bestellnummer aus Referenz
   - Status wird automatisch auf `paid` gesetzt
   - Bestätigungs-E-Mail wird automatisch gesendet
   - Transaktion wird in `payment_transactions` gespeichert

**Webhook Payload Format (Beispiel):**
```json
{
  "event_type": "payment.success",
  "transaction_id": "lemfi_tx_123456",
  "reference": "CEE-1234567890",
  "amount": 150.50,
  "currency": "EUR",
  "status": "success",
  "timestamp": "2026-02-20T19:00:00Z"
}
```

---

## 📊 Admin: Wie stelle ich fest, dass bezahlt wurde?

### Methode 1: Admin Dashboard
1. Login mit Admin-Account
2. Navigiere zu **Order Management**
3. Alle Bestellungen werden angezeigt mit:
   - Bestellnummer
   - **Payment Status** (pending / paid / partial)
   - Order Status (pending / processing / shipped / delivered)
   - Datum
4. Filter nach `payment_status = 'pending'` um offene Zahlungen zu sehen

### Methode 2: LemFi Konto prüfen
1. Login bei LemFi
2. Prüfe eingehende Zahlungen
3. Vergleiche **Referenz-Nummer** mit Bestellnummer
4. Wenn gefunden → Status im Admin-Panel ändern

### Methode 3: Payment Transactions Tabelle
Direkter Datenbankzugriff:
```sql
SELECT
  o.order_number,
  o.payment_status,
  pt.transaction_id,
  pt.amount,
  pt.status,
  pt.created_at
FROM orders o
LEFT JOIN payment_transactions pt ON pt.order_id = o.id
WHERE o.payment_status = 'pending'
ORDER BY o.created_at DESC;
```

---

## 🔐 Sicherheit

- **RLS aktiviert** auf allen Tabellen
- **Webhook Signature Verification** implementiert (wenn LemFi bereitstellt)
- **Service Role Key** nur in Edge Functions verwendet
- E-Mails werden nur an verifizierte User-E-Mails gesendet

---

## 🧪 Testen

### Test 1: Bestellbestätigungs-E-Mail
1. Melde dich mit einem Test-Account an
2. Lege Produkte in den Warenkorb
3. Gehe zum Checkout
4. Schließe Bestellung ab
5. **Prüfe E-Mail-Postfach** → Du solltest eine Bestätigungs-E-Mail erhalten

### Test 2: Zahlungsbestätigung (Manuell)
1. Gehe zum Admin-Dashboard
2. Finde die Testbestellung
3. Ändere `Payment Status` von `pending` zu `paid`
4. **Prüfe E-Mail-Postfach** → Du solltest eine Zahlungsbestätigungs-E-Mail erhalten

### Test 3: LemFi Webhook (Falls konfiguriert)
```bash
curl -X POST https://[YOUR-SUPABASE-URL]/functions/v1/lemfi-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "payment.success",
    "transaction_id": "test_123",
    "reference": "CEE-1234567890",
    "amount": 100.00,
    "currency": "EUR",
    "status": "success",
    "timestamp": "2026-02-20T19:00:00Z"
  }'
```

---

## 📝 Wichtige Hinweise

### Supabase E-Mail Limits (Kostenlose Version)
- **Max. 4 E-Mails pro Stunde** pro User
- **Nur für Authentifizierung** gedacht
- **Für Produktion:** Verwende SendGrid, Resend oder Mailgun

### E-Mail wird nicht gesendet?
Prüfe:
1. User hat verifizierte E-Mail-Adresse
2. Supabase E-Mail-Service ist aktiviert
3. Edge Function Logs: `supabase functions logs send-order-email`
4. Browser Console für Fehler

### LemFi Webhook funktioniert nicht?
Prüfe:
1. Webhook URL ist korrekt konfiguriert
2. Bestellnummer ist im `reference` Feld
3. Edge Function Logs: `supabase functions logs lemfi-webhook`
4. Webhook Signature ist korrekt (falls LemFi bereitstellt)

---

## 🚀 Nächste Schritte für Produktion

1. **E-Mail-Service upgraden:**
   - SendGrid / Resend / Mailgun integrieren
   - Keine Limits mehr

2. **LemFi Webhook aktivieren:**
   - Webhook URL bei LemFi registrieren
   - Webhook Secret konfigurieren
   - Automatische Zahlungsverifizierung

3. **E-Mail Templates anpassen:**
   - Firmen-Logo hinzufügen
   - Design verbessern
   - Mehr Details

4. **Benachrichtigungen erweitern:**
   - WhatsApp Benachrichtigungen
   - SMS für wichtige Updates
   - Push-Benachrichtigungen in App

---

## 📞 Support

Bei Fragen oder Problemen:
- E-Mail: support@germanlink.business
- WhatsApp: +49-XXX-XXXXXXX
