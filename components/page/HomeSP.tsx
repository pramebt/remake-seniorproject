import React, { FC, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import {
  usePushNotifications,
  sendExpoPushTokenToBackend,
} from "../../app/usePushNotifications";

import { LoadingScreenBaby } from "../LoadingScreen";
import { LinearGradient } from "expo-linear-gradient";

export interface Child {
  child_id: number;
  childName: string;
  nickname: string;
  birthday: string;
  gender: string;
  childPic: string;
  age?: number; // Add age property (optional)
}

export interface Room {
  rooms_id: number;
  rooms_name: string;
  roomsPic: string;
  childs_count: number;
  colors: string;
}

// fn calculate age
export const calculateAge = (
  birthday: string
): { years: number; months: number } => {
  const birthDate = new Date(birthday); // แปลง birthday เป็น Date
  const today = new Date(); // วันที่ปัจจุบัน

  let years = today.getFullYear() - birthDate.getFullYear(); // คำนวณอายุในปี
  let months = today.getMonth() - birthDate.getMonth(); // คำนวณเดือน

  // ตรวจสอบเดือน
  if (months < 0) {
    years--; // ลดอายุลง 1 ปีถ้าปีนี้ยังไม่ถึงวันเกิด
    months += 12; // ปรับให้เดือนเป็นค่าบวก
  }

  // ตรวจสอบวัน
  if (today.getDate() < birthDate.getDate() && months > 0) {
    months--; // ลดเดือนลง 1 เดือนถ้ายังไม่ถึงวันเกิดในเดือนนี้
  }

  return { years, months }; // ส่งคืนปีและเดือน
};

export const HomeSP: FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [rooms, setRoom] = useState<Room[]>([]);

  const { expoPushToken } = usePushNotifications();
  // useEffect
  useFocusEffect(
    React.useCallback(() => {
      const fetchChildData = async () => {
        try {
          const supervisor_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");

          if (!supervisor_id) {
            console.error("Parent ID is missing.");
            return;
          }

          if (!token) {
            console.error("token is missing.");
            return;
          }
          setLoading(true);
          if (expoPushToken) {
            const user_id = parseInt(supervisor_id, 10);
            if (!isNaN(user_id)) {
              await sendExpoPushTokenToBackend(expoPushToken, user_id);
            } else {
              console.error("Invalid user ID.");
            }
          }

          if (supervisor_id) {
            const response = await fetch(
              `https://senior-test-deploy-production-1362.up.railway.app/api/rooms/get-all-data?supervisor_id=${supervisor_id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const jsonResponse = await response.json();
              console.log("json response HOME: ", jsonResponse);
              if (jsonResponse.rooms) {
                const updatedRoom: Room[] = jsonResponse.rooms.map(
                  (rooms: Room) => {
                    const imageUrl = `https://senior-test-deploy-production-1362.up.railway.app/${rooms.roomsPic}`;
                    return {
                      ...rooms,
                      roomsPic: imageUrl,
                      colors: rooms.colors || "#c5e5fc",
                    };
                  }
                );
                setTimeout(() => {
                  setRoom(updatedRoom);
                  setLoading(false);
                }, 100); // set delay
              } else {
                setRoom([]);
                setLoading(false);
              }
            } else {
              console.error(
                "HTTP Error: ",
                response.status,
                response.statusText
              );
              setLoading(false);
            }
          }
        } catch (error) {
          console.error("Error retrieving child data:", error);
        }
      };

      fetchChildData();
    }, [expoPushToken])
  );

  const whenGotoAddroom = () => {
    navigation.navigate("addroom");
  };
  const whenGotoAddchildSP = () => {
    navigation.navigate("addchildSP");
  };

  const whengotoChooseChildSP = (rooms: Room) => {
    navigation.navigate("choosechildsp", { rooms });
  };

  const whenGotoChooseRoom = () => {
    navigation.navigate("chooseroom");
  };

  const [showIcons, setShowIcons] = useState(false); // สถานะการโชว์ไอคอน
  const rotation = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    setShowIcons((prev) => !prev);
  };

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"], // หมุน 45 องศา
  });

  if (loading) {
    return <LoadingScreenBaby />;
  }

  
  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={styles.roomInfo}>
            <ScrollView
              horizontal={true} // เปิดการเลื่อนแนวนอน
              style={styles.ScrollView}
              contentContainerStyle={styles.scrollContent}
              showsHorizontalScrollIndicator={false}
            >
              {rooms.length === 0 ? (
                <View style={styles.profileCardIntro}>
                  <Image
                    source={require("../../assets/icons/User_Icon.png")}
                    style={styles.profileIcon}
                  />
                  <View style={styles.profileInfo}>
                    <View style={styles.IntroContainer}>
                      <Text style={styles.TextIntro}>กรุณาเพิ่มข้อมูลเด็ก</Text>
                    </View>
                    <Pressable style={styles.detailButtonIntro}>
                      <Text style={styles.detailTextIntro}>
                        เพิ่มข้อมูลเด็กที่นี่
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                rooms.map((rooms) => (
                  <Pressable
                    key={rooms.rooms_id}
                    style={[
                      styles.CardRoom,
                      { backgroundColor: rooms.colors || "#c5e5fc" },
                    ]}
                    onPress={() => whengotoChooseChildSP(rooms)}
                  >
                    <Image
                      source={
                        rooms.roomsPic
                          ? { uri: rooms.roomsPic }
                          : require("../../assets/icons/User_Icon.png")
                      }
                      style={styles.profileIcon}
                    />

                    <View style={styles.profileInfo}>
                      <View style={styles.detailsName}>
                        <Text style={styles.profileName}>
                          {rooms.rooms_name}
                        </Text>
                      </View>
                      <View style={styles.detailsAge}>
                        <Text style={styles.profileAge}>
                          {rooms.childs_count}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
      <View style={styles.addContainer}>
        {/* ไอคอนที่ 2 */}
        <View>
          <Pressable onPress={whenGotoAddroom}>
          <LinearGradient
            colors={["#F5E5FF", "#E1D7FF", "#CEC9FF"]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButton}
          >
            <Image
              source={require("../../assets/icons/group.png")}
              style={styles.icon}
            />
             </LinearGradient>
          </Pressable>
        </View>
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        <Pressable onPress={whenGotoChooseRoom}>
          <LinearGradient
            colors={["#FFFFFF", "#E6FFF0", "#DCF5F0"]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.evaluateButton}
          >
            <Image
              source={require("../../assets/icons/assessment.png")}
              style={styles.asessmentIcon}
            />
            <Text style={styles.evaluateText}>เริ่มการประเมิน</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.graphContainer}>
          <Image
            source={require("../../assets/image/bar_chart.png")}
            style={styles.graphImage}
          />
        </View>
        <View style={styles.pieChartContainer}>
          <Image
            source={require("../../assets/image/pie_chart.png")}
            style={styles.pieChartImage}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
    paddingTop: 50,

    //marginTop: 45, //กรอบสีขาว
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  card: {
    alignItems: "center",
    backgroundColor: "#FFEFD5",
    padding: 10,
    borderRadius: 10,
    width: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  roomInfo: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: "100%",
    height: "100%",
    borderWidth: 1,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  countText: {
    fontSize: 12,
    color: "#555",
  },
  addContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: "#000",
    borderRadius: 30, // half width,height for cycle
    width: "100%",
    height: 62,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 10,
    bottom: 10,
  },
  

  //----------------------------------------------------------------

  middleSection: {
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    marginBottom: 10,

    paddingHorizontal: 20,
  },
  evaluateButton: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    width: "100%",
    height: 95,
  },
  asessmentIcon: {
    width: 65,
    height: 65,
    marginLeft: 10,
  },
  evaluateText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginLeft: 50,
  },
  //------------------------------------------------------------------
  bottomSection: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 20,
    marginLeft: 20,
    marginRight: 20,
    marginVertical: 10,
    height: "auto",
    marginBottom: 100,
  },
  graphContainer: {
    width: "100%",
    height: "50%",
    backgroundColor: "#ffffff",
    bottom: 5,
    borderRadius: 10,
  },
  graphImage: {
    width: "100%",
    height: "auto",
  },
  pieChartContainer: {
    width: "100%",
    height: "50%",
    backgroundColor: "#ffffff",
    top: 5,
    borderRadius: 10,
  },
  pieChartImage: {
    width: "80%",
    height: "auto",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#E0FFFF",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  footerIcon: {
    width: 30,
    height: 30,
  },
  //------------------------------------------------------------------
  CardRoom: {
    alignItems: "center",
    justifyContent: "center", // จัดเนื้อหาภายในการ์ดให้อยู่กึ่งกลาง
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: 100, // ใช้ความกว้างแบบยืดหยุ่น

    height: 132,
    marginHorizontal: 15,
  },
  ScrollView: {
    flex: 1,
    width: "100%",
    // borderWidth: 2,
    borderRadius: 20,
    height: "100%",
  },
  scrollContent: {
    flexDirection: "row", // เรียงแนวนอน
    alignItems: "center", // จัดให้อยู่ตรงกลางแนวตั้ง
    paddingVertical: 10,
    height: "100%", // ให้ ScrollView กินพื้นที่แนวตั้งทั้งหมด
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
  profileIcon: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
  },
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
  detailTextIntro: {
    fontSize: 14,
    color: "#000",
    padding: 2,
  },
  TextIntro: {
    fontSize: 16,
    fontWeight: "bold",
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
  detailsName: {
    width: "auto",

    marginTop: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
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
  profileAge: {
    fontSize: 14,
    color: "#555",
  },
});
