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

// import DatePicker from "react-native-date-picker";
import { LoadingScreenBaby } from "../LoadingScreen";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart, PieChart } from "react-native-chart-kit";
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

export const GraphDashboard = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState<boolean>(true);
    
  const [dashboardData, setDashboardData] = useState<AssessmentData | null>();
  const screenWidth = Dimensions.get("window").width;

  useFocusEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supervisor_id = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("userToken");
        if (!supervisor_id) {
                    console.error("Supervisor ID is missing.");
                    return;
                  }
        
                  

        setLoading(true);

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

    fetchDashboardData();
  },);
  //================================================================================================
  // ============ whenGoto Function ============
  
  const goBack = () => {
    navigation.goBack();
  };
  // ดึงข้อมูลด้านพัฒนาและแยกค่าผ่าน/ไม่ผ่าน
  const labels = dashboardData?.data?.map((item) => item.aspect) ?? [];
  const passedCounts =
    dashboardData?.data?.map((item) => Number(item.passed_count) || 0) ?? [];
  const notPassedCounts =
    dashboardData?.data?.map((item) => Number(item.not_passed_count) || 0) ??
    [];
  const totalPassed = dashboardData?.data?.reduce(
    (sum, item) => sum + (Number(item.passed_count) || 0),
    0
  );
  const totalNotPassed = dashboardData?.data?.reduce(
    (sum, item) => sum + (Number(item.not_passed_count) || 0),
    0
  );
  const barData = {
    labels: labels,
    datasets: [
      {
        data: passedCounts, // ✅ จำนวนเด็กที่ผ่าน
        color: (opacity = 1) => `rgba(72, 191, 227, ${opacity})`, // สีฟ้า
      },
      {
        data: notPassedCounts, // ✅ จำนวนเด็กที่ไม่ผ่าน
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`, // สีแดง
      },
    ],
  };
  // return
  return (
    <ScrollView
      style={styles.scrollviewALL}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          padding: 20,
          margin: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 4,
          maxHeight: 500,
        }}
      >
        <View style={styles.graphContainer}>
          
          {/* กราฟ BarChart */}
          <BarChart
            data={{
              labels: labels, // แกน X เป็นด้านพัฒนาการ
              datasets: [
                {
                  data: labels.map(
                    (_, index) => passedCounts[index] + notPassedCounts[index]
                  ), // ✅ จำนวนที่ประเมิน = ผ่าน + ไม่ผ่าน
                },
                {
                  data: notPassedCounts, // ✅ จำนวนเด็กที่ไม่ผ่าน
                  color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`, // สีแดง
                },
              ],
            }}
            width={screenWidth - 100} // ✅ ปรับให้เล็กลง
            height={180} // ✅ ลดความสูงของ BarChart
            yAxisLabel=""
            yAxisSuffix="" // ✅ แก้ไข Error โดยเพิ่ม yAxisSuffix
            yAxisInterval={4}
            chartConfig={{
              backgroundGradientFrom: "#f0f0f0",
              backgroundGradientTo: "#f0f0f0",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              barPercentage: 0.8, // ✅ ปรับให้แท่งกราฟแคบลง (0.8 = 80% ของพื้นที่)
            }}
            fromZero
            showBarTops={true}
            showValuesOnTopOfBars
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
                <Pressable style={styles.backButton} onPress={goBack}>
                  <Image
                    source={require("../../assets/icons/back.png")}
                    style={styles.Icon}
                  />
                </Pressable>
              </View>
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  scrollviewALL: {
    flex: 1,
    backgroundColor: "#F0F8FF",
    maxHeight: "95%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 170,
    flexDirection: "row",
    paddingHorizontal: 20,
    width: "100%",
    height: 45,
    minHeight: 0,
    paddingLeft:120,
    
  },
  backButton: {
    backgroundColor: "#cce9fe",
    left: 20,
    padding: 8,
    borderRadius: 30,
    width: 100,
    alignItems: "center",
    shadowColor: "#848484",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  graphContainer: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    borderRadius: 10,
    height: "55%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    
  },
  Icon: {
    width: 30,
    height: 30,
  },
  
});
