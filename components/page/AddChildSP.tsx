import React, { FC, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  ImageBackground,
  Keyboard,
  Modal,
} from "react-native";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";

// Form validation schema
const AddChildSchema = z.object({
  childName: z.string().min(5, "กรุณาระบุชื่อ-นามสกุลเด็ก").max(150),
  nickname: z.string().min(2, "กรุณาระบุชื่อเล่นเด็ก").max(150),
  birthday: z.date({
    required_error: "กรุณาระบุวันเกิดเด็ก",
    invalid_type_error: "รูปแบบวันเกิดไม่ถูกต้อง",
  }),
  gender: z.enum(["male", "female"]),
});

// Type Definitions
type AddChildModel = z.infer<typeof AddChildSchema>;

export const AddChildSP: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AddChildModel>({
    resolver: zodResolver(AddChildSchema),
  });
  // hooks
  const navigation = useNavigation<NavigationProp<any>>();

  const [childPic, setChildPic] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ฟังก์ชันการจัดการการยืนยันวันที่
  const handleConfirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    // แปลงวันที่เป็นรูปแบบ YYYY-MM-DD
    const formattedDate = format(selectedDate, "yyyy-MM-dd"); // ใช้ format จาก date-fns
    setSelectedDate(formattedDate); // เก็บวันที่ที่แปลงแล้วใน state
    setDate(selectedDate); // เก็บ Date object
    setValue("birthday", selectedDate); // ส่งค่าไปยัง react-hook-form
  };

  // ฟังก์ชันขออนุญาต
  const requestPermission = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "You need to grant permission to access the media library."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting permission:", error);
      Alert.alert(
        "Permission Error",
        "An error occurred while requesting permissions."
      );
      return false;
    }
  };

  // ฟังก์ชันเลือกภาพ
  const selectImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;

      // สร้างโฟลเดอร์หากยังไม่มี
      const imgDir = FileSystem.documentDirectory + "images/";
      await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });

      // บันทึกรูปภาพลงในเครื่อง
      const filename = new Date().getTime() + ".jpeg";
      const dest = imgDir + filename;
      await FileSystem.copyAsync({ from: selectedImageUri, to: dest });
      setChildPic(dest); // ตั้ง path ของภาพที่บันทึกไว้ใน state
      console.log("Selected and saved Image URI:", dest);
    }
  };

  // ฟังก์ชันสำหรับส่งข้อมูล
  const onSubmit: SubmitHandler<AddChildModel> = async (formData) => {
    const userId = await AsyncStorage.getItem("userId");
    console.log("Form data:", formData);
    console.log("UserId: ", userId);
    console.log("Date: ", selectedDate);
    //console.log("childPic data:", childPic);

    try {
      const data = new FormData();
      // Append values only if they are not null
      if (formData.childName) {
        data.append("childName", formData.childName);
      }
      if (formData.nickname) {
        data.append("nickname", formData.nickname);
      }
      if (selectedDate) {
        data.append("birthday", selectedDate);
      }
      if (formData.gender) {
        data.append("gender", formData.gender);
      }
      if (userId) {
        data.append("supervisor_id", userId);
      }

      // ตรวจสอบว่ามีรูปภาพหรือไม่
      if (childPic) {
        try {
          // Use the file URI directly without fetching it
          const filename = childPic.split("/").pop(); // Extract filename from URI
          const imageType = "image/jpeg"; // Change according to your image type

          // Append the image correctly to FormData
          data.append("childPic", {
            uri: childPic,
            name: filename,
            type: imageType, // Set the correct type
          } as any); // Use 'as any' to bypass type checking if necessary

          console.log("childPic data:", childPic);
          console.log("Appending image with filename:", filename);
        } catch (error) {
          console.error("Error processing image:", error);
        }
      } else {
        console.log("No childPic provided");
      }

      // ส่งคำขอไปยัง API
      const resp = await fetch(
        "https://senior-test-deploy-production-1362.up.railway.app/api/childs/addChild",
        {
          method: "POST",
          body: data,
        }
      );

      // ตรวจสอบสถานะของการตอบสนองจาก API
      const jsonResp = await resp.json();
      console.log("API Response:", jsonResp);

      if (resp.ok) {
        Alert.alert("สำเร็จ", "เพิ่มข้อมูลเด็กสำเร็จ");
        // await AsyncStorage.setItem("ProfileChild", jsonResp.childPic);
        navigation.navigate("mainSP");
      } else if (resp.status === 409) {
        Alert.alert("ไม่สำเร็จ", "มีเด็กในระบบอยู่แล้ว");
        navigation.navigate("mainSP");
      } else {
        const errorResponse = await resp.text();
        console.error("Error response from server:", errorResponse);
        Alert.alert("ระบบมีปัญหา", errorResponse || "กรุณาลองอีกครั้ง");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("ระบบมีปัญหา", "กรุณาลองอีกครั้ง");
    }
  };
  // // for test
  // const whenGotoAssessment = () => {
  //   navigation.navigate("assessment");
  // };
  // // navigate to
  // const whenGoBacktoHome = () => {
  //   navigation.navigate("mainPR");
  // };
  // navigate goBack
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {/* <ScrollView contentContainerStyle={styles.scrollContainer}> */}
      <ImageBackground
        source={require("../../assets/background/bg2.png")}
        style={styles.background}
      >
        {/* Top Section */}
        <Text style={styles.HeaderText}>ข้อมูลเด็กที่ต้องการเพิ่ม</Text>

        {/* Mid Section */}
        <View style={styles.Inputcontainer}>
          <View style={styles.avatarContainer}>
            {/* placeholder of Picture */}
            <View style={styles.avtarFrame}>
              {childPic ? (
                <Image source={{ uri: childPic }} style={styles.avatar} />
              ) : (
                <Image
                  source={require("../../assets/icons/userIcon.png")}
                  style={styles.avatar}
                />
              )}
            </View>
            <Pressable style={styles.addIconSection} onPress={selectImage}>
              <Image
                source={require("../../assets/icons/add.png")}
                style={styles.addIcon}
              />
            </Pressable>
          </View>
          <LinearGradient
            colors={["#E2F0E9", "#F1FFEC", "#ECFFF8"]}
            style={styles.container}
          >
            {/* Input Section */}
            <View style={styles.MiddleSection}>
              <Text style={styles.OnInputText}>ชื่อ-นามสกุล</Text>
              <Controller
                control={control}
                name="childName"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={[
                        styles.input,
                        errors.childName && styles.errorInput,
                      ]}
                      placeholder="ชื่อ-สกุล"
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors.childName && (
                      <Text style={styles.errorText}>
                        {errors.childName && (
                          <Text style={styles.errorText}>
                            กรุณาระบุชื่อเด็ก
                          </Text>
                        )}
                      </Text>
                    )}
                  </>
                )}
              />

              <Text style={styles.OnInputText}>ชื่อเล่น</Text>
              <Controller
                control={control}
                name="nickname"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={[
                        styles.input,
                        errors.nickname && styles.errorInput,
                      ]}
                      placeholder="ชื่อเล่น"
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors.nickname && (
                      <Text style={styles.errorText}>
                        {errors.nickname && (
                          <Text style={styles.errorText}>
                            กรุณาระบุชื่อเล่นเด็ก
                          </Text>
                        )}
                      </Text>
                    )}
                  </>
                )}
              />

              <Text style={styles.OnInputText}>วันเกิด</Text>

              <TouchableOpacity
                style={styles.input} // ใช้สไตล์เดียวกับ TextInput
                onPress={() => setShowDatePicker(true)} // กดเพื่อเปิด DateTimePicker
              >
                <Text style={styles.inputText}>
                  {selectedDate || "วันเกิดเด็ก"}
                </Text>
              </TouchableOpacity>

              {showDatePicker &&
                (Platform.OS === "ios" ? (
                  <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showDatePicker}
                  >
                    <View style={styles.modalBackground}>
                      <View style={styles.pickerContainer}>
                        <DateTimePicker
                          value={date}
                          mode="date"
                          display="inline"
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                              handleConfirm(selectedDate);
                            }
                          }}
                          textColor="black"
                          themeVariant="light"
                        />
                      </View>
                    </View>
                  </Modal>
                ) : (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="calendar"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        handleConfirm(selectedDate);
                      }
                    }}
                  />
                ))}

              {errors.birthday && (
                <Text style={styles.errorText}>กรุณาระบุวันเกิดเด็ก</Text>
              )}

              <Text style={styles.label}>เพศ</Text>
              <View style={styles.genderContainer}>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.genderOptions}>
                      <TouchableOpacity
                        onPress={() => onChange("male")}
                        style={styles.genderOption}
                      >
                        <View
                          style={
                            value === "male"
                              ? styles.radioSelected
                              : styles.radio
                          }
                        />
                        <Text>ชาย</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => onChange("female")}
                        style={styles.genderOption}
                      >
                        <View
                          style={
                            value === "female"
                              ? styles.radioSelected
                              : styles.radio
                          }
                        />
                        <Text>หญิง</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            </View>
          </LinearGradient>
        </View>
        {/* Bottom Section */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.backButton} onPress={goBack}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.Icon}
            />
          </Pressable>
          <Pressable
            //onPress={whenGotoAssessment}
            onPress={handleSubmit(onSubmit)}
            style={styles.submitButton}
          >
            <Text style={styles.buttonText}>บันทึก</Text>
          </Pressable>
        </View>
      </ImageBackground>
      {/* </ScrollView> */}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  MiddleSection: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    padding: 10,
    paddingTop: 50,
    //borderWidth:2,
  },
  SafeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 750,
  },
  Inputcontainer: {
    width: "90%",
    height: "61%",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    top: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    // borderWidth: 2,
    marginTop: 60, // Add marginTop to prevent overlapping
  },
  container: {
    // flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#eafff8",
    borderRadius: 20,
    padding: 20,
    // borderWidth: 2,
  },

  input: {
    width: "100%",
    height: 50,
    borderColor: "#D9D9D9",
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 20,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  inputText: {
    left: 0,
    top: 15,
    //justifyContent: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  genderContainer: {
    //flexDirection: "row",
    flex: 1,
    marginTop: 5,
    marginBottom: 50,
    alignContent: "center",
    alignItems: "center",
    //backgroundColor: "#000",
  },
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    marginRight: 10,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 25,
    flexDirection: "row",
    paddingHorizontal: 20,
    width: "100%",
    height: 45,
    minHeight: 0,
    padding: 0,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
  },
  //
  avatarContainer: {
    position: "absolute",
    top: -50, // Adjust the top position to move it above the container
    zIndex: 1,
    // borderWidth: 3,
  },
  avtarFrame: {
    borderRadius: 50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  addIcon: {
    top: 4,
    width: 27,
    height: 27,
  },
  addIconSection: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#FFD3AB",
  },
  backButton: {
    backgroundColor: "#cce9fe",
    left: 20,
    right: 50,
    padding: 8,
    borderRadius: 30,
    width: "25%",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#ffffff",
    left: 70,
    right: 20,
    padding: 10,
    borderRadius: 30,
    width: "50%",
    alignItems: "center",
  },
  Icon: {
    width: 30,
    height: 30,
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    top: -7,
    marginBottom: 5,
    left: 8,
  },
  HeaderText: {
    bottom: "3%",
    fontSize: 22,
    fontWeight: "bold",
  },
  OnInputText: {
    fontSize: 14,
    textAlign: "left",
    left: 8,
    marginBottom: 2,
  },
  Datepicker: {
    width: "100%",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Darken background
  },
  pickerContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
