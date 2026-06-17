import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { ResumeJSON } from "@/types/resume";

const styles = StyleSheet.create({
  page: { padding: 42, fontSize: 10, fontFamily: "Helvetica", color: "#18181b" },
  name: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 9, color: "#52525b", marginBottom: 18 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: "#534AB7", marginBottom: 6, textTransform: "uppercase" },
  role: { fontSize: 11, fontWeight: 700 },
  line: { marginBottom: 3 },
  bullet: { marginBottom: 3, paddingLeft: 8 }
});

function ResumeDocument({ resume }: { resume: ResumeJSON }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{resume.name || "Candidate"}</Text>
        <Text style={styles.meta}>{[resume.email, resume.phone, resume.location].filter(Boolean).join(" | ")}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text>{resume.summary}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {resume.experience.map((item) => (
            <View key={`${item.company}-${item.title}`} style={styles.line}>
              <Text style={styles.role}>{item.title} - {item.company}</Text>
              <Text style={styles.meta}>{item.duration}</Text>
              {item.bullets.map((bullet) => (
                <Text key={bullet} style={styles.bullet}>- {bullet}</Text>
              ))}
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text>{resume.skills.join(", ")}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {resume.education.map((item) => (
            <Text key={`${item.institution}-${item.degree}`} style={styles.line}>
              {item.degree}, {item.institution} {item.year}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export async function generateResumePDF(resume: ResumeJSON) {
  return renderToBuffer(<ResumeDocument resume={resume} />);
}
