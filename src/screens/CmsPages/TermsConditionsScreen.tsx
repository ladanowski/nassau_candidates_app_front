import React from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';

const TermsConditionsScreen: React.FC = () => {

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={"Terms and Conditions"} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>
          Voter Information as a Public Record
        </Text>

        <Text style={styles.text}>
          Pursuant to FS 97.0585, Voter registration information is public record in Florida with a few exceptions. Information such as your
          social security number, Florida driver license number and Florida ID number, all declinations to register to vote, information relating
          to the place where a person registered to vote or where a person updated their voter registration, and information relating to a
          voter’s prior felony conviction and whether such person has had his or her voting rights restored cannot be released or disclosed to
          the public under any circumstances. Your signature can be viewed, but not copied. Other information such as your name, address,
          date of birth, party affiliation, and when you voted is public information
        </Text>

        <Text style={styles.textImportant}>
          * Your voter registration information may not be publicly disclosed or made available, provided:
        </Text>

        <View style={styles.textPointsView}>
          <Text style={styles.textBullets}>1.</Text>
          <Text style={styles.textPoints}>
            You are or become a participant in the Attorney General’s Address Confidentiality Program for victims of domestic
            violence and stalking. See section 97.0585(3) and sections 741.401-741.465, Florida Statutes. Contact the
            Attorney General’s Office’s Bureau of Advocacy and Grants Management at 850.414.3300 for instructions on how
            to become a participant.
          </Text>
        </View>

        <View style={styles.textPointsView}>
          <Text style={styles.textBullets}>2.</Text>
          <Text style={styles.textPoints}>
            You submit a written request to each agency that may have your information such as your address, photo, and date
            of birth. However, you must fall within one of the statutorily designated classes of high-risk professionals. Please
            refer to the <Text style={{ color: Colors.light.secondary }} onPress={() => Linking.openURL("https://www.votenassaufl.gov/forms")}>Public Records Exemption Request Form</Text> and submit the completed form to the Nassau County
            Supervisor of Elections office at the address provided on the form
          </Text>
        </View>

        <Text style={styles.text}>
          Public information can find its way onto the Internet or websites by individuals or entities that obtain public records from the State
          and other agencies. Once information is in the public domain, you will need to contact the owner or administrator of third-party sites
          in order to get the information removed.
        </Text>

        <Text style={styles.heading}>
          Accessibility Policy
        </Text>

        <Text style={styles.text}>
          The Nassau County Supervisor of Elections is committed to making our website accessible to all visitors. In 2021, we
          redesigned our website to improve the user experience, and to ensure that it meets or exceeds the requirements of
          Section 508 of the Rehabilitation Act of 1973, as well as the Web Content Accessibility Guidelines established by the
          World Wide Web Consortium (WCAG 2.0 - Level AA). {"\n \n"}
          Our website is a mix of historical and new content. In the event that you encounter content that is not accessible, we will
          work to provide a text version or other accessible alternative for the content. We use Cascading Style Sheets (CSS) for
          page layout and text formatting. By using relative and adjustable font sizes, users can set the text size to better suit their
          needs. Our website also includes PDF documents. Downloadable Acrobat Reader software, accessibility plug-ins, and
          online conversion tools are available from Adobe. To make it easier for people with screen readers to jump to the content,
          one of the first lines that a screen reader sees is the option to jump to the main content of this page. The access key to
          jump to the main content is "ALT" plus "X". {"\n \n"}
          We welcome your feedback on the accessibility of our website. If you have specific questions or concerns, please
          email info@votenassau.com or call (904) 491.7500 and tell the operator that you have feedback about our website.
          Please be as specific as possible with your feedback, so that we can easily locate the problem.
        </Text>

        <Text style={[styles.heading, { marginBottom: 8 }]}>
          CONTACT
        </Text>

        <View style={styles.contactRow}>
          <Text style={styles.label}>Hours:</Text>
          <Text style={styles.value}>8:00 AM to 5:00 PM, Monday through Friday</Text>
        </View>

        <View style={styles.contactRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={[styles.value, { textDecorationLine: 'underline', color: Colors.light.secondary }]} onPress={() => Linking.openURL("tel:904-491-7500")}>904-491-7500</Text>
        </View>

        <View style={styles.contactRow}>
          <Text style={styles.label}>Toll Free:</Text>
          <Text style={[styles.value, { textDecorationLine: 'underline', color: Colors.light.secondary }]} onPress={() => Linking.openURL("tel:1-866-260-4301")}>1-866-260-4301</Text>
        </View>

        <View style={styles.contactRow}>
          <Text style={styles.label}>Fax:</Text>
          <Text style={styles.value}>904-432-1400</Text>
        </View>

        <View style={styles.contactRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={[styles.value, { textDecorationLine: 'underline', color: Colors.light.secondary }]} onPress={() => Linking.openURL("mailto:info@votenassaufl.gov")}>info@votenassaufl.gov</Text>
        </View>


        <Text style={[styles.heading, { marginTop: 8 }]}>
          SOCIAL
        </Text>
        <Text style={styles.text}>
          Under Florida law, email addresses are public records. If you do not want your e-mail address released in response to a
          public records request, do not send electronic mail to this entity. Instead, contact this office by phone or in writing.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'left',
    fontFamily: 'MyriadPro-Bold',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    fontFamily: 'MyriadPro-Regular',
    marginTop: 8,
    marginBottom: 8,
  },
  textImportant: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    fontFamily: 'MyriadPro-Bold',
    marginTop: 8,
    marginBottom: 8,
  },
  textPointsView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginBottom: 8,
  },
  textBullets: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    fontFamily: 'MyriadPro-Regular',
  },
  textPoints: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    fontFamily: 'MyriadPro-Regular',
    // marginTop: 8,
    marginLeft: 8,
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 90,
    color: Colors.light.text,
    fontFamily: 'MyriadPro-Bold',
    fontSize: 16,
    lineHeight: 20,
  },
  value: {
    flex: 1,
    color: Colors.light.text,
    fontFamily: 'MyriadPro-Regular',
    fontSize: 16,
    lineHeight: 20,
  },
});

export default TermsConditionsScreen;