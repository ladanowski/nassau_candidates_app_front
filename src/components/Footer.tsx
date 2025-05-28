import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";
import { svgs } from "../constants/images";

const socialIcons = [
  { key: 'facebook', icon: svgs.facebook, url: 'https://www.facebook.com/votenassaufl/' },
  { key: 'instagram', icon: svgs.instagram, url: 'https://www.instagram.com/votenassaufl/' },
  { key: 'twitter', icon: svgs.twitter, url: 'https://twitter.com/votenassaufl/' },
];

const Footer: React.FC = () => {
    return (
        <View style={styles.footer}>
            <Text style={{ textAlign: 'center', fontSize: 16, color: Colors.light.primary, fontFamily: 'MyriadPro-Bold', marginBottom: 8 }}>
                Follow us! @votenassaufl
            </Text>
            <View style={styles.socialIcons}>
                {socialIcons.map(icon => (
                    <TouchableOpacity key={icon.key} style={styles.socialIcon} activeOpacity={0.7} onPress={() => Linking.openURL(icon.url)}>
                        <icon.icon width={32} height={32} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default Footer;

const styles = StyleSheet.create({
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.light.background,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    marginHorizontal: 12,
  },

});