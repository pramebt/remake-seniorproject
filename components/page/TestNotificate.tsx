import React, { FC, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Pressable,
} from "react-native";
import { usePushNotifications } from "../../app/usePushNotifications"; // hook สำหรับ push notification
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export const Notificate: FC = () => {
  const { notification } = usePushNotifications(); // รับการแจ้งเตือนจาก push notification
  const [notifications, setNotifications] = useState<any[]>([]);

  // ดึงข้อมูลการแจ้งเตือนจาก API
  useFocusEffect(
    useCallback(() => {
      const fetchNotifications = async () => {
        try {
          const user_id = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");

          if (!user_id) {
            console.error("User ID is missing.");
            return;
          }

          const response = await fetch(
            `https://senior-test-deploy-production-1362.up.railway.app/api/notifications/get-all-notificate?user_id=${user_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Error fetching notifications");
          }

          const data = await response.json();
          setNotifications(data.notifications);
          console.log("setNotifications: ", data.notifications);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };

      fetchNotifications();

      if (notification) {
        const newNotification = {
          name: "User", // ปรับให้แสดงชื่อผู้ส่งจริง
          date: new Date().toLocaleDateString(),
          message: notification.request.content.body,
        };

        setNotifications((prevNotifications) => {
          const updatedNotifications = [newNotification, ...prevNotifications];

          if (updatedNotifications.length > 10) {
            updatedNotifications.pop(); // เก็บแค่ 10 รายการล่าสุด
          }

          return updatedNotifications;
        });
      }
    }, [notification])
  );

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // api approveAccessRequest

  const handleApprove = async (child_id: number, supervisor_id: number) => {
    console.log("child_id: ", child_id);
    console.log("supervisor_id: ", supervisor_id);

    try {
      const parent_id = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");

      const response = await fetch(
        "https://senior-test-deploy-production-1362.up.railway.app/api/notifications/appprove-access-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ child_id, supervisor_id, parent_id }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Approval failed.");
      console.log("Approval successful:", data.message);
    } catch (error) {
      console.error("Error approving access request:", error);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  return (
    <ImageBackground
      source={require("../../assets/background/bg1.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.header}>การแจ้งเตือน</Text>

        {notifications.map((notif, index) => (
          <View key={index} style={styles.notificationBox}>
            <Text style={styles.date}>{notif.created_at}</Text>
            <View style={styles.notificationTopBox}>
              <View style={styles.iconContainer}>
                <Image
                  source={require("../../assets/icons/notification.png")}
                  style={styles.icon}
                />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.message}>{notif.message}</Text>
              </View>
            </View>

            <View style={styles.resultButtonCantainer}>
              <Pressable
                style={styles.yesButton}
                onPress={() =>
                  handleApprove(notif.child_id, notif.supervisor_id)
                }
              >
                <Text>ยินยอม</Text>
              </Pressable>
              <Pressable style={styles.noButton}>
                <Text>ปฎิเสธ</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  ScrollView: {
    width: "100%",
    marginBottom: "25%",
    borderWidth: 2,
    borderRadius: 30,
  },
  container: {
    flex: 1,
    padding: 10,
    paddingTop: "15%",
    alignItems: "center",
  },
  notificationTopBox: {
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    // marginBottom: 10,
    borderColor: "#333333",
    width: "100%",
    height: "45%",
    // borderWidth: 1,
  },
  notificationBox: {
    // flexDirection: "row",
    // alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    // padding: 13,
    marginBottom: 10,
    borderColor: "#333333",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: "100%",
    height: "22%",
  },
  iconContainer: {
    marginRight: 10,
  },
  icon: {
    width: 45,
    height: 45,
  },
  textContainer: {
    flex: 1,
    // marginTop: 10,
  },
  message: {
    fontSize: 16,
    color: "#333333",
  },
  name: {
    fontWeight: "bold",
    color: "#6495ED",
  },
  date: {
    fontSize: 12,
    color: "#999999",
    textAlign: "right",
    margin: 5,
    // paddingTop: 2,
  },
  header: {
    fontSize: 24,
    color: "#333333",
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 20,
  },

  resultButtonCantainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginVertical: 5,
    paddingHorizontal: "15%",
    // borderWidth: 2,
  },
  yesButton: {
    backgroundColor: "#DAF0C8",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
  },
  noButton: {
    backgroundColor: "#FFC1C1",
    padding: 10,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
  },
});
