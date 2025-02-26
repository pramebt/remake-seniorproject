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
  TouchableHighlight,
  Dimensions,
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
import { BarChart, PieChart } from "react-native-chart-kit";
export interface Child {
  child_id: number;
  childName: string;
  nickName: string;
  birthday: string;
  gender: string;
  childPic: string;
  age?: number; // Add age property (optional)
}
type AssessmentData = {
  message: string;
  data: {
    aspect: string;
    passed_count: number;
    not_passed_count: number;
  
  }[];
  summary: {
    passed_count: number;
    not_passed_count: number;
  };
};


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
  const [dashboardData, setDashboardData] = useState<AssessmentData | null>(null);

  const { expoPushToken } = usePushNotifications();
  const colorGradients: { [key: string]: [string, string, ...string[]] } = {
    "#FF5733": ["#FFFFFF", "#FFDEE4", "#FFBED6"], // แดง
    "#33FF57": ["#FFFFFF", "#6BFF8F", "#A0FFB9"], // เขียว
    "#3357FF": ["#FFFFFF", "#D6F3FF", "#c5e5fc"], // น้ำเงิน
    "#F1C40F": ["#FFFFFF", "#FFF8E5", "#FAE9BE"], // เหลือง
    "#8E44AD": ["#FFFFFF", "#F7E9FF", "#DEC9F2"], // ม่วง
    "#1ABC9C": ["#FFFFFF", "#48E0C2", "#A0FFF2"], // เขียวอมฟ้า
    "#E74C3C": ["#FFFFFF", "#FF7675", "#FFC3B9"], // แดงอ่อน
  };
  const defaultGradient: [string, string] = ["#c5e5fc", "#ffffff"];
  const screenWidth = Dimensions.get("window").width;
  
  
  // useEffect
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const supervisor_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");

          if (!supervisor_id) {
            console.error("Supervisor ID is missing.");
            return;
          }

          if (!token) {
            console.error("Token is missing.");
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

          // Fetch Room Data
          const roomResponse = await fetch(
            `https://senior-test-deploy-production-1362.up.railway.app/api/rooms/get-all-data?supervisor_id=${supervisor_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (roomResponse.ok) {
            const jsonResponse = await roomResponse.json();
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

              setRoom(updatedRoom);
            } else {
              setRoom([]);
            }
          } else {
            console.error(
              "HTTP Error: ",
              roomResponse.status,
              roomResponse.statusText
            );
          }

          // Fetch Dashboard Data
          const dashboardResponse = await fetch(
            `https://senior-test-deploy-production-1362.up.railway.app/api/assessments/assessments-data-supervisor/${supervisor_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            console.log("Dashboard Data: ", dashboardData);
            setDashboardData(dashboardData); // Ensure you have a state variable for this
          } else {
            console.error(
              "HTTP Error: ",
              dashboardResponse.status,
              dashboardResponse.statusText
            );
          }

          setLoading(false);
        } catch (error) {
          console.error("Error retrieving data:", error);
          setLoading(false);
        }
      };

      fetchData();
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

  //ตรวจสอบว่ามีข้อมูลหรือไม่
  if (!dashboardData || !dashboardData.data || dashboardData.data.length === 0) {
    return <Text>ไม่มีข้อมูลการประเมิน</Text>;
  }

  // ดึงข้อมูลด้านพัฒนาและแยกค่าผ่าน/ไม่ผ่าน
  const labels = dashboardData?.data?.map((item) => item.aspect) ?? [];
const passedData = dashboardData?.data?.map((item) => Number(item.passed_count) || 0) ?? [];
const notPassedData = dashboardData?.data?.map((item) => Number(item.not_passed_count) || 0) ?? [];
const totalPassed = dashboardData?.data?.reduce((sum, item) => sum + (Number(item.passed_count) || 0), 0);
const totalNotPassed = dashboardData?.data?.reduce((sum, item) => sum + (Number(item.not_passed_count) || 0), 0);
  const barData = {
    labels: labels, // ["GM", "FM", "RL", ...]
    datasets: [
      {
        data: passedData // จำนวนเด็กที่ผ่าน
      },
      {
        data: notPassedData // จำนวนเด็กที่ไม่ผ่าน
      }
    ]
  };
  
  const pieData = [
    { name: "ผ่าน", population: totalPassed, color: "#72C3DC", legendFontColor: "#000", legendFontSize: 14 },
    { name: "ไม่ผ่าน", population: totalNotPassed, color: "#FF6B6B", legendFontColor: "#000", legendFontSize: 14 }
  ];

  // if (loading) {
  //   return <LoadingScreenBaby />;
  // }

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <ScrollView   horizontal={true} showsHorizontalScrollIndicator={false}>
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
                    onPress={() => whengotoChooseChildSP(rooms)}
                  >
                    <LinearGradient
                      colors={colorGradients[rooms.colors] ?? defaultGradient} // ใช้ Gradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.CardRoom}
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
                    </LinearGradient>
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
          <TouchableOpacity onPress={whenGotoAddroom}>
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
          </TouchableOpacity>
        </View>
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        <TouchableOpacity onPress={whenGotoChooseRoom}>
          <LinearGradient
            colors={["#FFFFFF", "#E6FFF0", "#DCF5F0"]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.evaluateButton}
          >
            <Image
              source={require("../../assets/icons/assessmentSP.png")}
              style={styles.asessmentIcon}
            />
            <Text style={styles.evaluateText}>เริ่มการประเมิน</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View style={styles.graphContainer}>
    <Text>จำนวนเด็กที่ผ่านและไม่ผ่านการประเมิน</Text>
    
    <BarChart
      data={barData}
      width={screenWidth - 40}
      height={220}
      yAxisLabel="คน "
      yAxisSuffix=""
      chartConfig={{
        backgroundGradientFrom: "#FFFFFF",
        backgroundGradientTo: "#FFFFFF",
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        barPercentage: 0.5
      }}
      fromZero
    />
  </View>

    {/* Pie Chart */}
    <PieChart
    data={pieData}
    width={screenWidth - 40}
    height={220}
    chartConfig={{
      backgroundGradientFrom: "#FFFFFF",
      backgroundGradientTo: "#FFFFFF",
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
    }}
    accessor={"population"}
    backgroundColor={"transparent"}
    paddingLeft={"15"}
    absolute
  />
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
    shadowOpacity: 1,
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
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 10,
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
    paddingHorizontal: 20,
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
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
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
    borderRadius: 30,
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
    borderRadius: 30,
    alignItems: "center",
  },
  profileAge: {
    fontSize: 14,
    color: "#555",
  },
});
