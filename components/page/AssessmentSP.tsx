// Assessment.tsx
import { FC } from "react";
import {
  ImageBackground,
  View,
  StyleSheet,
  Pressable,
  Text,
  Image,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  RouteProp,
  useRoute,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Child } from "./HomeSP";

type AssessmentRouteProp = RouteProp<
  { assessment: { child: Child } },
  "assessment"
>;

export const AssessmentSP: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<AssessmentRouteProp>();
  const { child } = route.params;

  // navigate
  const whenGotoGMSP = (child: Child) => {
    navigation.navigate("gmsp", { child });
  };

  const whenGotoFMSP = (child: Child) => {
    navigation.navigate("fmsp", { child });
  };

  const whenGotoRLSP = (child: Child) => {
    navigation.navigate("rlsp", { child });
  };

  const whenGotoELSP = (child: Child) => {
    navigation.navigate("elsp", { child });
  };

  const whenGotoPSSP = (child: Child) => {
    navigation.navigate("spsp", { child });
  };
  
  const whenGotoHomeSP = () => {
    navigation.navigate("mainSP");
  };
  
  const whenGotoEditChildSP = (child: Child) => {
    navigation.navigate("editchildsp", { child });
  };
  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={require("../../assets/background/bg2.png")}
      style={styles.background}
    >
      {/* Top Section */}
      <View style={styles.topSection}>
        <View
          key={child.child_id}
          style={
            child.gender === "male"
              ? styles.profileCardBoy
              : styles.profileCardGirl
          }
        >
          <Image source={{ uri: child.childPic }} style={styles.profileIcon} />
          <View style={styles.profileInfo}>
            <View style={styles.detailsName}>
              <Text style={styles.profileName}>{child.nickName}</Text>
            </View>
            <View style={styles.detailsAge}>
              <Text style={styles.profileAge}>{child.age}</Text>
            </View>
            <Pressable
              key={child.child_id}
              style={
                child.gender === "male"
                  ? styles.detailsButtonBoy
                  : styles.detailsButtonGirl
              }
              onPress={() => whenGotoEditChildSP(child)}
            >
              <Text style={styles.detailsText}>แก้ไขข้อมูล</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Mid Section */}
      <View style={styles.midSection}>
        <Text style={styles.headerText}>เลือกด้านที่ต้องการประเมิน</Text>
        {/* GM */}
        <Pressable style={styles.childDev} onPress={() => whenGotoGMSP(child)}>
          <Image
            source={require("../../assets/icons/GM.png")}
            style={styles.childDevIcon}
          />
          <Text style={styles.childDevtext}>Gross Motor(GM)</Text>
        </Pressable>
        {/* FM */}
        <Pressable style={styles.childDev} onPress={() => whenGotoFMSP(child)}>
          <Image
            source={require("../../assets/icons/FM.png")}
            style={styles.childDevIcon}
          />
          <Text style={styles.childDevtext}>Fine Motor(FM)</Text>
        </Pressable>
        {/* RL */}
        <Pressable style={styles.childDev} onPress={() => whenGotoRLSP(child)}>
          <Image
            source={require("../../assets/icons/RL.png")}
            style={styles.childDevIcon}
          />
          <Text style={styles.childDevtext}>Receptive Language(RL)</Text>
        </Pressable>
        {/* EL */}
        <Pressable style={styles.childDev} onPress={() => whenGotoELSP(child)}>
          <Image
            source={require("../../assets/icons/EL.png")}
            style={styles.childDevIcon}
          />
          <Text style={styles.childDevtext}>Expressive Language(EL)</Text>
        </Pressable>
        {/* PS */}
        <Pressable style={styles.childDev} onPress={() => whenGotoPSSP(child)}>
          <Image
            source={require("../../assets/icons/PS.png")}
            style={styles.childDevIcon}
          />
          <Text style={styles.childDevtext}>Personal and Social(PS)</Text>
        </Pressable>
      </View>
      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.backButton} onPress={goBack}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.Icon}
            />
          </Pressable>
          <Pressable onPress={whenGotoHomeSP} style={styles.homeButton}>
            <Image
              source={require("../../assets/icons/home.png")}
              style={styles.Icon}
            />
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    //justifyContent: "center",
    alignItems: "center",
  },
  topSection: {
    flex: 1,
    width: "100%",
    paddingBottom: 20,
    alignItems: "center",
  },
  midSection: {
    flex: 1,
    width: 350,
    marginTop: 15,
    paddingBottom: "80%",
    paddingVertical: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    backgroundColor: "#E0F7F3",
    //justifyContent: "center",
    alignItems: "center",
  },
  bottomSection: {
    flexDirection: "row",
    width: "100%",
    paddingTop: 30,
    paddingBottom: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCardGirl: {
    flexDirection: "row",
    width: 350,
    height: 130,
    alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    marginTop: 60,
  },
  profileCardBoy: {
    flexDirection: "row",
    width: 350,
    alignItems: "center",
    backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    marginTop: 70,
  },
  profileIcon: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  profileAge: {
    fontSize: 14,
    color: "#555",
  },
  detailsButtonGirl: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#FFA2C4",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
  },
  detailsButtonBoy: {
    width: "85%",
    marginLeft: 10,
    marginTop: 9,
    backgroundColor: "#98D4FF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
  },
  detailsName: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsAge: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: "center",
  },
  detailsText: {
    fontSize: 12,
    color: "#FFF",
    padding: 2,
  },
  buttonContainer: {
    flexDirection: "row", // จัดปุ่มให้อยู่ในแถวเดียวกัน
    justifyContent: "space-around", // จัดปุ่มให้มีระยะห่างเท่ากัน
    paddingHorizontal: 20, // ระยะห่างด้านข้างของปุ่ม
    width: "80%",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  homeButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  Icon: {
    width: 30,
    height: 30,
  },
  childDev: {
    flexDirection: "row",
    width: "90%",
    paddingVertical: 15,
    marginVertical: 6,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  childDevIcon: {
    width: 45,
    height: 45,
    right: 15,
  },
  childDevtext: {
    fontSize: 18,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    bottom: 5,
  },
});
