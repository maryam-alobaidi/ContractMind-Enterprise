using ContractMind.BLL.Interface;
using System.Text.RegularExpressions;


namespace ContractMind.BLL.Services
{
    public class PrivacyService : IPrivacyService
    {
        public string MaskSensitiveData(string rawText)
        {
            if (string.IsNullOrEmpty(rawText))
                return rawText;

            string maskedText = rawText;

            // 1. تنقيح البريد الإلكتروني (Email)
            maskedText = Regex.Replace(maskedText,
                @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
                "[EMAIL_ADDRESS]",
                RegexOptions.IgnoreCase);

            // 2. تنقيح هويات DNI/NIE الإسبانية (مثال: 45123456Z أو Y1234567X)
            maskedText = Regex.Replace(maskedText,
                @"\b[XYZxyz]?\d{7,8}[A-Za-z]\b",
                "[ID_NUMBER]");

            // 3. تنقيح الهويات الوطنية المتسلسلة (10-12 رقم مجرد بدون علامة +)
            maskedText = Regex.Replace(maskedText,
                @"(?<!\+)\b\d{10,12}\b",
                "[ID_NUMBER]");

            // 4. تنقيح أرقام الهواتف (الدولية والمحلية)
            maskedText = Regex.Replace(maskedText,
                @"\+?\b\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b",
                "[PHONE_NUMBER]");

            // 5. الألقاب والأسماء الإسبانية (تدعم Don, Doña, Cliente, comparece, إلخ)
            string[] legalTitlesSpanish = {
                "Primer Parte", "Segunda Parte", "Don", "Doña", "Sr.", "Sra.",
                "Cliente", "Demandante", "Demandado", "comparece", "العميل السيد"
            };
            foreach (var title in legalTitlesSpanish)
            {
                string pattern = $@"\b({title})\s*[:\s]\s*([A-ZÁÉÍÓÚÑأ-يa-záéíóúñ]+(?:\s+(?:de|del|la|las|los|y|[A-ZÁÉÍÓÚÑأ-يa-záéíóúñ]+)){{1,4}})\b";
                maskedText = Regex.Replace(maskedText, pattern, "$1: [CLIENT_NAME]", RegexOptions.IgnoreCase);
            }

            // 6. الألقاب والأسماء العربية والإنجليزية
            string[] legalTitlesOther = {
                "الطرف الأول", "الطرف الثاني", "السيد", "السيدة", "المكلف", "الموكل",
                "العميل السيد", "المدعي", "المدعى عليه", "المواطن", "الوكيل",

                // --- اللغة الإنجليزية ---
                "First Party", "Second Party", "Client", "Mr.", "Mrs.", "Plaintiff", "Defendant",

                // --- اللغة الإسبانية (عامة وأطراف وتوثيق وعقود) ---
                "Primer Parte", "Segunda Parte", "Don", "Doña", "Sr.", "Sra.",
                "Señor", "Señora", "Cliente", "Demandante", "Demandado",
                "comparece", "reúnen", "actúa",

                // الإيجار والبيع والتمويل والتوثيق
                "Arrendador", "Arrendadora", "Arrendatario", "Arrendataria",
                "Comprador", "Compradora", "Vendedor", "Vendedora",
                "Prestamista", "Prestatario", "Prestataria",
                "Notario", "Notaria", "Apoderado", "Apoderada", "Testigo"
            };
            foreach (var title in legalTitlesOther)
            {
                string pattern = $@"\b({title})\s*[:\s]\s*([A-ZÁÉÍÓÚÑأ-يa-záéíóúñ\s]{3,35})\b";
                maskedText = Regex.Replace(maskedText, pattern, "$1: [CLIENT_NAME]", RegexOptions.IgnoreCase);
            }

            return maskedText;
        }
    }
}