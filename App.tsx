// App.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import * as Linking from "expo-linking";

// === ( Import Components ) ===
import { Login } from "./components/Login";
import { ForgetPassword } from "./components/ForgetPassword";
import { ResetPassword } from "./components/ResetPassword";
import { Register } from "./components/Register";
import { MainSP } from "./components/MainSP";
import { MainPR } from "./components/MainPR";
import { store } from "./app/store";
import { Welcome } from "./components/Welcome";
import { Privacy } from "./components/Privacy";
import { HomeAD } from "./components/page/HomeAD";
import { SplashScreen } from "./components/SplashScreen";
import { EditRoom } from "./components/page/EditRoom";
import { AddChild } from "./components/page/Addchild";
import { EditChildSP } from "./components/page/EditChildSP";
import { ChooseChild } from "./components/page/ChooseChild";
import { Assessment } from "./components/page/Assessment";
import { AssessmentSP } from "./components/page/AssessmentSP";
import { GM } from "./components/assessment/GM";
import { FM } from "./components/assessment/FM";
import { RL } from "./components/assessment/RL";
import { EL } from "./components/assessment/EL";
import { PS } from "./components/assessment/PS";
import { Training } from "./components/assessment/Training";
import { TrainingSP } from "./components/assessment/TrainingSP";
import { UpdateProfile } from "./components/page/UpdateProfile";
import { AddRoom } from "./components/page/AddRoom";
import { AddchildSP } from "./components/page/AddchildSP";
import { ChooseRoom } from "./components/page/ChooseRoom";
import { ChooseChildSP } from "./components/page/ChooseChildSP";
import { GMSP } from "./components/assessment/GMSP";
import { FMSP } from "./components/assessment/FMSP";
import { RLSP } from "./components/assessment/RLSP";
import { ELSP } from "./components/assessment/ELSP";
import { PSSP } from "./components/assessment/PSSP";
import { HospitalDetailScreen } from "./components/HospitalDetailScreen";
import { ChildDetailSP } from "./components/page/ChildDetailSP";

// === ( Navigation Setup ) ===
const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [
    Linking.createURL("/"), // Expo Go
    "dekdek://", // ใช้กับ Custom Scheme บน Mobile
    "https://senior-test-deploy-production-1362.up.railway.app",
  ],
  config: {
    screens: {
      resetPassword: "reset-password/:token",
      login: "login",
    },
  },
};

// === ( Main Application Component ) ===
export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" component={SplashScreen} />

          <Stack.Screen name="welcome" component={Welcome} />
          <Stack.Screen name="login" component={Login} />
          <Stack.Screen name="reset-password" component={ResetPassword} />
          <Stack.Screen name="forgetPassword" component={ForgetPassword} />
          <Stack.Screen name="register" component={Register} />
          <Stack.Screen name="privacy" component={Privacy} />
          <Stack.Screen name="mainPR" component={MainPR} />

          <Stack.Screen name="mainSP" component={MainSP} />
          <Stack.Screen name="choosechild" component={ChooseChild} />
          <Stack.Screen name="addchild" component={AddChild} />
          <Stack.Screen name="editchildsp" component={EditChildSP} />
          <Stack.Screen name="assessment" component={Assessment} />
          <Stack.Screen name="assessmentsp" component={AssessmentSP} />
          <Stack.Screen name="gm" component={GM} />
          <Stack.Screen name="fm" component={FM} />
          <Stack.Screen name="rl" component={RL} />
          <Stack.Screen name="el" component={EL} />
          <Stack.Screen name="sp" component={PS} />
          <Stack.Screen name="gmsp" component={GMSP} />
          <Stack.Screen name="fmsp" component={FMSP} />
          <Stack.Screen name="rlsp" component={RLSP} />
          <Stack.Screen name="elsp" component={ELSP} />
          <Stack.Screen name="spsp" component={PSSP} />
          <Stack.Screen name="training" component={Training} />
          <Stack.Screen name="trainingsp" component={TrainingSP} />
          <Stack.Screen name="updateprofile" component={UpdateProfile} />
          <Stack.Screen name="editroom" component={EditRoom} />
          <Stack.Screen name="addroom" component={AddRoom} />
          <Stack.Screen name="addchildSP" component={AddchildSP} />
          <Stack.Screen name="chooseroom" component={ChooseRoom} />
          <Stack.Screen name="choosechildsp" component={ChooseChildSP} />
          <Stack.Screen name="childdetailsp" component={ChildDetailSP} />
          <Stack.Screen name="adminHome" component={HomeAD} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}