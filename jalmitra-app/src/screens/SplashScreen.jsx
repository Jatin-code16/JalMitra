import React from "react";
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { strings } from "../constants/strings";
import { useTheme } from "../context/ThemeContext";
import BrandMark from "../components/BrandMark";

const SplashScreen = () => {
	const { colors } = useTheme();
	const styles = createStyles(colors);
	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<BrandMark size={88} subtitle={strings.tagline} align="center" />
		</SafeAreaView>
	);
};

const createStyles = (colors) => StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.bgBase,
		padding: 24,
	},
	title: {
		fontSize: 32,
		fontWeight: "800",
		color: colors.primary,
		marginBottom: 8,
	},
	tagline: {
		fontSize: 16,
		color: colors.muted,
		textAlign: "center",
	},
});

export default SplashScreen;
