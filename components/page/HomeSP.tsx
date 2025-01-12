import React, { FC, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
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

export interface Child {
  child_id: number;
  childName: string;
  nickname: string;
  birthday: string;
  gender: string;
  childPic: string;
  age?: number; // Add age property (optional)
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
  const [room, setRoom] = useState<Room[]>([]); // กำหนดประเภทเป็น array ของ Child

  useFocusEffect(
    React.useCallback(() => {
      const fetchChildData = async () => {
        try {
          const supervisor_id = await AsyncStorage.getItem("userId");

          if (supervisor_id) {
            const response = await fetch(
              `https://senior-test-deploy-production-1362.up.railway.app/api/childs/get-child-data?parent_id=${supervisor_id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.ok) {
              const jsonResponse = await response.json();

              if (jsonResponse.success && jsonResponse.room) {
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

                setRoom(updatedChildren); // setting age child
              } else {
                setRoom([]);
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

  const whenGotoAssessment = (room: Room) => {
    navigation.navigate("assessment", { room });
  };

  const whenGotoChooseChild = () => {
    navigation.navigate("choosechild");
  };

  const [showIcons, setShowIcons] = useState(false); // สถานะการโชว์ไอคอน
  const translation1 = useRef(new Animated.Value(0)).current; // ไอคอนที่สอง
  const translation2 = useRef(new Animated.Value(0)).current; // ไอคอนที่สาม
  const handlePress = () => {
    if (showIcons) {
      // ซ่อนไอคอนและแอนิเมชันย้อนกลับ
      Animated.parallel([
        Animated.timing(translation1, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translation2, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowIcons(false));
    } else {
      // โชว์ไอคอนและแอนิเมชันเลื่อนไปทางขวา
      setShowIcons(true);
      Animated.parallel([
        Animated.timing(translation1, {
          toValue: 80,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translation2, {
          toValue: 160,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.roomInfo} className="bo">
            <View style={styles.card}>
              <Image
                source={require("../../assets/image/chicken.png")}
                style={styles.icon}
              />
              <Text style={styles.cardText}>อนุบาล ก.ไก่</Text>
              <Text style={styles.countText}>20 คน</Text>
            </View>
            <View style={styles.card}>
              <Image
                source={require("../../assets/image/grape.jpg")}
                style={styles.icon}
              />
              <Text style={styles.cardText}>อนุบาล อ.องุ่น</Text>
              <Text style={styles.countText}>20 คน</Text>
            </View>
            <View style={styles.card}>
              <Image
                source={require("../../assets/image/banana.png")}
                style={styles.icon}
              />
              <Text style={styles.cardText}>อนุบาล ค.คน</Text>
              <Text style={styles.countText}>20 คน</Text>
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={styles.addContainer}>
        {/* ไอคอนแรก */}
        <Pressable style={styles.addButton} onPress={handlePress}>
          {/* รูปไอคอน */}
          <View style={styles.starIcon}>
            <View style={[styles.starArm, styles.vertical]} />
            {/* แฉกแนวนอน */}
            <View style={[styles.starArm, styles.horizontal]} />
          </View>
        </Pressable>

        {/* ไอคอนที่ 2 */}
        {showIcons && (
          <Animated.View
            style={[
              styles.animatedButton,
              { transform: [{ translateX: translation1 }] },
            ]}
          >
            <Pressable style={styles.addButton}>{/* รูปไอคอน */}</Pressable>
          </Animated.View>
        )}

        {/* ไอคอนที่ 3 */}
        {showIcons && (
          <Animated.View
            style={[
              styles.animatedButton,
              { transform: [{ translateX: translation2 }] },
            ]}
          >
            <Pressable style={styles.addButton}>{/* รูปไอคอน */}</Pressable>
          </Animated.View>
        )}
      </View>
      {/* Middle Section */}
      <View style={styles.middleSection}>
        <Pressable style={styles.evaluateButton} onPress={whenGotoChooseChild}>
          <Image
            source={require("../../assets/icons/assessment.png")}
            style={styles.asessmentIcon}
          />
          <Text style={styles.evaluateText}>เริ่มการประเมิน</Text>
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
    borderWidth: 2,
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
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    width: "105%",
    height: 130,
    marginLeft: 5,
    borderWidth: 2,
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
    flexDirection: "row",
  },
  addButton: {
    backgroundColor: "#FFF",
    marginLeft: 20,
    borderRadius: 30, // half width,height for cycle
    width: 62,
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
  addIcon: {
    width: 45,
    height: 45,
  },
  animatedButton: {
    position: "absolute", // ช่วยจัดตำแหน่ง
  },
  starIcon: {
    position: "relative",
    width: 50, // ขนาดของดาว
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  
  starArm: {
    position: "absolute",
    backgroundColor: "#8DD9BD",
    borderRadius: 2,
  },
  vertical: {
    width: 7, // ความกว้างของแฉก
    height: 30, // ความยาวของแฉก
  },
  horizontal: {
    width: 30, // ความยาวของแฉก
    height: 7, // ความกว้างของแฉก
  },
  //----------------------------------------------------------------

  middleSection: {
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    marginBottom: 10,
    borderWidth: 2,
    paddingHorizontal: 20,
  },
  evaluateButton: {
    backgroundColor: "#ccfff5",
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
    borderWidth: 2,
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
    borderWidth: 2,
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
    borderWidth: 2,
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
});
