import Colors from "@/constants/Colors";
import { Image, Pressable, StyleSheet, Text } from "react-native";
import { Tables } from "@/types";
import { Link, useSegments } from "expo-router";
import { defaultPizzaImage } from "@/constants/Images";
import RemoteImage from "./RemoteImage";

type Props = {
    product: Tables<"products">;
};

const ProductListItem = ({ product }: Props) => {
    const segments = useSegments();
    return (
        <Link href={`/${segments[0]}/menu/${product.id}`} asChild>
            <Pressable style={styles.container}>
                <RemoteImage
                    path={product.image}
                    fallback={defaultPizzaImage}
                    style={styles.image}
                    resizeMode="contain"
                />
                <Text style={styles.title}>{product.name}</Text>
                <Text style={styles.price}>${product.price}</Text>
            </Pressable>
        </Link>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 10,
        borderRadius: 20,
        maxWidth: "50%",
    },
    image: {
        width: "100%",
        aspectRatio: 1,
    },
    title: {
        color: Colors.light.tint,
        fontSize: 20,
        fontWeight: "bold",
    },
    price: {
        color: Colors.light.tint,
        fontWeight: "bold",
    },
});

export default ProductListItem;
