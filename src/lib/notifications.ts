import { InsertTables } from "./../types";
import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { supabase } from "./supabase";
import { Tables } from "@/database.types";
import { useAuth } from "@/providers/AuthProvider";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

// Can use this function below or use Expo's Push Notification Tool from: https://expo.dev/notifications
export async function sendPushNotification(
    expoPushToken: Notifications.ExpoPushToken,
    title: string,
    body: string
) {
    const message = {
        to: expoPushToken,
        sound: "default",
        title,
        body,
        data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
    });
}

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== "granted") {
            alert("Failed to get push token for push notification!");
            return;
        }
        token = (
            await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas.projectId,
            })
        ).data;
        console.log(token);
    } else {
        // alert("Must use physical device for Push Notifications");
    }

    return token;
}

const getUserToken = async (userId: string) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    return data?.expo_push_token;
};

const getAdminToken = async () => {
    const { profile, isAdmin } = useAuth();

    const { data, error } = await supabase
        .from("profiles")
        .select("expo_push_token")
        .eq("id", isAdmin && profile?.id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data?.expo_push_token;
};

export async function notifyUserAboutOrderUpdate(order: Tables<"orders">) {
    const token = await getUserToken(order?.user_id);
    const title = order.status === "New" ? "New order placed" : "Order updated";
    const body = `Your order #${order.id} has been ${
        order.status === "New" ? "placed" : order.status
    }`;

    sendPushNotification(token, title, body);
}

export async function notifyAdminAboutNewOrder() {
    const token = await getAdminToken();
    const title = "New order placed";
    const body = "You have received new order ";

    if (token) {
        await sendPushNotification(token, title, body);
    }
}
