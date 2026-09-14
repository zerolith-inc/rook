import { useQuery } from "@tanstack/react-query";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { fetchHealth } from "@/lib/api";

const Home = () => {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => fetchHealth(signal),
    retry: false,
    refetchInterval: 10_000,
  });
  let status = "Connected";
  if (health.isError) {
    status = "Unavailable";
  } else if (health.isPending) {
    status = "Connecting…";
  }
  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="grow px-6 py-12 sm:px-12"
    >
      <View className="mx-auto w-full max-w-3xl flex-1 gap-16">
        <View className="border-border flex-row items-center justify-between border-b pb-6">
          <Text className="text-lg font-semibold tracking-widest">ROOK</Text>
          <Text className="text-muted-foreground font-mono text-xs">
            DEVELOPMENT
          </Text>
        </View>
        <View className="gap-6 py-8">
          <Text
            variant="h1"
            className="text-left text-5xl font-semibold sm:text-6xl"
          >
            A team of agents, built on DSH.
          </Text>
          <Text className="text-muted-foreground max-w-xl text-lg leading-8">
            Your workspace starts here. Rook is in early development.
          </Text>
        </View>
        <View className="border-border gap-6 border-y py-8">
          <Text variant="h2" className="border-0 text-xl">
            Workspace status
          </Text>
          <View className="flex-row items-center justify-between gap-4">
            <Text>Local API</Text>
            <Text
              accessibilityLiveRegion="polite"
              className="font-mono text-sm"
            >
              {status}
            </Text>
          </View>
          <View className="flex-row items-center justify-between gap-4">
            <Text>Agent runtime</Text>
            <Text className="text-muted-foreground font-mono text-sm">
              Not configured
            </Text>
          </View>
          {health.isError && (
            <Text role="alert" className="text-destructive text-sm">
              Cannot reach the API. Check that the local server is running, then
              retry.
            </Text>
          )}
          <Button
            variant="outline"
            className="self-start"
            disabled={health.isFetching}
            onPress={() => {
              health.refetch();
            }}
          >
            <Text>{health.isFetching ? "Checking…" : "Check connection"}</Text>
          </Button>
        </View>
        <Text className="text-muted-foreground pb-8 text-sm">
          Rook · Development workspace
        </Text>
      </View>
    </ScrollView>
  );
};

export default Home;
