import React, { FC, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  ScrollView,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { Child, calculateAge } from "../../components/page/HomePR";

export const ChooseChild: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [children, setChildren] = useState<Child[]>([]); // กำหนดประเภทเป็น array ของ Child

  useFocusEffect(
    React.useCallback(() => {
      const fetchChildData = async () => {
        try {
          const parent_id = await AsyncStorage.getItem("userId");

          if (parent_id) {
            const response = await fetch(
              `https://senior-test-deploy-production-1362.up.railway.app/api/childs/get-child-data?parent_id=${parent_id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.ok) {
              const jsonResponse = await response.json();

              if (jsonResponse.success && jsonResponse.children) {
                const updatedChildren: Child[] = jsonResponse.children.map(
                  (child: Child) => {
                    const { years, months } = calculateAge(child.birthday); // calculate years/months
                    const imageUrl = `https://senior-test-deploy-production-1362.up.railway.app/${child.childPic}`;
                    return {
                      ...child,
                      age: `${years} ปี ${months} เดือน`, // set age
                      childPic: imageUrl,
                    };
                  }
                );

                setChildren(updatedChildren); // setting age child
              } else {
                setChildren([]);
              }
            } else {
              console.error(
                "HTTP Error: ",
                response.status,
                response.statusText
              );
            }
          }
        } catch (error) {
          console.error("Error retrieving child data:", error);
        }
      };

      fetchChildData();
    }, [])
  );

  const whenGotoAddChild = () => {
    navigation.navigate("addchild");
  };

  const whenGotoDetail = (id: number) => {
    navigation.navigate("detail", { id });
  };

  const whenGotoAssessment = (child: Child) => {
    navigation.navigate("assessment", { child });
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
      <Text style={styles.header}>เลือกเด็กที่ต้องการประเมิน</Text>
      {/* Profile Card Section */}
      <View style={styles.midSection}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {children.length === 0 ? (
            <View style={styles.profileCardIntro}>
              <Image
                source={require("../../assets/icons/User_Icon.png")}
                style={styles.profileIcon}
              />
              <View style={styles.profileInfo}>
                <View style={styles.IntroContainer}>
                  <Text style={styles.TextIntro}>กรุณาเพิ่มข้อมูลเด็ก</Text>
                </View>
                <Pressable
                  style={styles.detailButtonIntro}
                  onPress={whenGotoAddChild}
                >
                  <Text style={styles.detailTextIntro}>
                    เพิ่มข้อมูลเด็กที่นี่
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            children.map((child) => (
              <View
                key={child.child_id}
                style={
                  child.gender === "male"
                    ? styles.profileCardBoy
                    : styles.profileCardGirl
                }
              >
                <Pressable onPress={() => whenGotoAssessment(child)}>
                  <Image
                    source={
                      child.childPic
                        ? { uri: child.childPic }
                        : require("../../assets/icons/User_Icon.png")
                    }
                    style={styles.profileIcon}
                  />
                </Pressable>
                <View style={styles.profileInfo}>
                  <View style={styles.detailsName}>
                    <Text style={styles.profileName}>{child.childName}</Text>
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
                    //onPress={() => whenGotoDetail(child.id)}
                  >
                    <Text style={styles.detailsText}>ดูรายละเอียด</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.backButton} onPress={goBack}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.Icon}
            />
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  Container: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    //borderWidth: 2,
  },
  ScrollView: {
    width: "100%",
    borderWidth: 2,
    borderRadius: 30,
  },
  midSection: {
    height: "70%",
  },
  bottomSection: {
    width: "auto",
    height: "15%",
    paddingTop: 30,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 80,
    marginBottom: 20,
  },
  profileCardGirl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffd7e5",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: 330,
    marginTop: 15,
  },
  profileCardBoy: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c5e5fc",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: 330,
    marginTop: 15,
  },
  profileIcon: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
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
    marginVertical: 2,
  },
  detailsButtonBoy: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#98D4FF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
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
  buttonContainer: {
    //position: "absolute",
    flexDirection: "row", // จัดปุ่มให้อยู่ในแถวเดียวกัน
    //justifyContent: "space-around", // จัดปุ่มให้มีระยะห่างเท่ากัน
    paddingHorizontal: 20, // ระยะห่างด้านข้างของปุ่ม
    width: "70%",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#cce9fe",
    padding: 10,
    borderRadius: 30,
    width: "60%",
    alignItems: "center",
  },
  Icon: {
    width: 30,
    height: 30,
  },

  // ----------------------------------------------------------------------------------
  IntroContainer: {
    width: "95%",
    marginLeft: 4,
    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCardIntro: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#b0b0b0",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: 350,
    height: 130,
  },
  detailButtonIntro: {
    width: "80%",
    marginLeft: 18,
    marginTop: 9,
    backgroundColor: "#ececec",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: "center",
  },
  detailTextIntro: {
    fontSize: 14,
    color: "#000",
    padding: 2,
  },
  TextIntro: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
