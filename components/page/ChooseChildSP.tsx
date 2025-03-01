import React, { FC, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
  RouteProp,
  useRoute,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { Child, calculateAge, Room } from "../../components/page/HomeSP";
type ChooseChildSPRountprop = RouteProp<
  { assessment: { rooms: Room } },
  "assessment"
>;
export const ChooseChildSP: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [children, setChildren] = useState<Child[]>([]); // กำหนดประเภทเป็น array ของ Child
  const route = useRoute<ChooseChildSPRountprop>();
  const { rooms } = route.params;
  const colorGradients: { [key: string]: [string, string, ...string[]] } = {
    "#FF5733": ["#FFFFFF", "#FFDEE4", "#FFBED6"], // แดง
    "#33FF57": ["#FFFFFF", "#6BFF8F", "#A0FFB9"], // เขียว
    "#3357FF": ["#FFFFFF", "#D6F3FF", "#c5e5fc"], // น้ำเงิน
    "#F1C40F": ["#FFFFFF", "#FFF8E5", "#FAE9BE"], // เหลือง
    "#8E44AD": ["#FFFFFF", "#F7E9FF", "#DEC9F2"], // ม่วง
    "#1ABC9C": ["#FFFFFF", "#48E0C2", "#A0FFF2"], // เขียวอมฟ้า
    "#E74C3C": ["#FFFFFF", "#FF7675", "#FFC3B9"], // แดงอ่อน
  };

  const defaultGradient: [string, string] = ["#c5e5fc", "#ffffff"]; // ถ้าไม่มีใช้สีเริ่มต้น
  useFocusEffect(
    React.useCallback(() => {
      const fetchChildDataForParent = async () => {
        try {
          const supervisor_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");

          if (!supervisor_id) {
            console.error("Supervisor ID is missing.");
            return;
          }

          const response = await fetch(
            `https://senior-test-deploy-production-1362.up.railway.app/api/rooms/get-child-data-of-room?supervisor_id=${supervisor_id}&rooms_id=${rooms.rooms_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const jsonResponse = await response.json();
            console.log("json response", jsonResponse);
            console.log("child response", jsonResponse.roomData.children);

            if (jsonResponse.children) {
              const updatedChildren: Child[] = jsonResponse.children.map(
                (child: Child) => {
                  const { years, months } = calculateAge(child.birthday);
                  const imageUrl = `https://senior-test-deploy-production-1362.up.railway.app/${child.childPic}`;
                  return {
                    ...child,
                    age: `${years} ปี ${months} เดือน`,
                    childPic: imageUrl,
                  };
                }
              );
              setChildren(updatedChildren);

              const allAssessments = jsonResponse.children.map(
                (child: any) => child.assessments || []
              );
            } else {
              console.log("No children found.");
              setChildren([]);
            }
          } else {
            console.error(
              `Error fetching data: ${response.status} ${response.statusText}`
            );
          }
        } catch (error) {
          console.error("Error fetching child data:", error);
        }
      };

      fetchChildDataForParent();
    }, [])
  );

  const whenGotoAddChildSP = (rooms: Room) => {
    navigation.navigate("addchildSP", { rooms });
  };

  const whenGotoChildDetailSP = (child: Child) => {
    navigation.navigate("childdetailsp", { child });
  };

  const whenGotoAssessmentSP = (child: Child) => {
    navigation.navigate("assessmentsp", { child });
  };

  const whenGotoEditRoom = (rooms: Room) => {
    navigation.navigate("editroom", { rooms });
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
      <View style={styles.topSection}>
        <LinearGradient
          colors={colorGradients[rooms.colors] || defaultGradient} // ใช้สีจากห้อง
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <Image source={{ uri: rooms.roomsPic }} style={styles.profileIcon} />
          <View style={styles.profileInfo}>
            <View style={styles.detailsName}>
              <Text style={styles.profileName}>{rooms.rooms_name}</Text>
            </View>
            <View style={styles.detailsAge}>
              <Text style={styles.profileAge}>{rooms.childs_count}</Text>
            </View>
            <TouchableOpacity style={styles.editroom} 
            onPress={() => whenGotoEditRoom(rooms)}
            >
              
              <Text style={styles.editroomtext} >แก้ไขห้องเรียน</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
      <Text style={styles.header}>เลือกเด็กที่ต้องการประเมิน</Text>
      {/* Profile Card Section */}
      <View style={styles.midSection}>
        <Pressable onPress={() => whenGotoAddChildSP(rooms)}>
          <LinearGradient
            colors={["#CEC9FF", "#F5E5FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 2 }}
            style={styles.addchildsp}
          >
            <Image
              source={require("../../assets/icons/addchild.png")}
              style={styles.addchildIcon}
            />
          </LinearGradient>
        </Pressable>
        <ScrollView
          style={styles.ScrollView}
          contentContainerStyle={styles.scrollContent} // กำหนดการจัดเรียงเนื้อหา
          showsVerticalScrollIndicator={false}
        >
          {children.map((child) => (
            <View key={child.child_id} style={styles.profileCardBoy}>
              <Pressable onPress={() => whenGotoAssessmentSP(child)}>
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
                  onPress={() => whenGotoChildDetailSP(child)}
                >
                  <Text style={styles.detailsText}>ดูรายละเอียด</Text>
                </Pressable>
              </View>
            </View>
          ))}
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
  topSection: {
    flex: 1,
    width: "100%",
    marginTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  ScrollView: {
    flex: 1, // ใช้พื้นที่ทั้งหมด
    width: "100%", // ให้เต็มความกว้างของหน้าจอ
    borderRadius: 20,
    marginTop: 10,
  },
  scrollContent: {
    alignItems: "center", // จัดเนื้อหาใน ScrollView ให้อยู่กึ่งกลางแนวนอน
    paddingBottom: 20, // เพิ่มพื้นที่ด้านล่าง
  },
  midSection: {
    height: "58%",
    width: "100%",
    justifyContent: "center", // จัดกึ่งกลางแนวตั้ง

    alignItems: "center", // จัดกึ่งกลางแนวนอน,
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
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
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
  addchildIcon: {
    width: 20,
    height: 30,
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
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
  addchildsp: {
    marginTop: 15, // เพิ่มระยะห่างจากปุ่ม Start Assessment
    width: 350,
    paddingVertical: 7,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: "#646464",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
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
    borderRadius: 30,
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
    borderRadius: 30,
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
  editroom: {
    width: "85%",
    marginLeft: 10,
    marginTop: 5,
    backgroundColor: "#817CD1",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 30,
    alignItems: "center",
  },
  editroomtext: {
    fontSize: 14,
    color: "#fff",
  },
});
