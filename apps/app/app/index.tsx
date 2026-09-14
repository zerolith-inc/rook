import { useQuery } from "@tanstack/react-query";
import { ScrollView, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { fetchHealth } from "@/lib/api";

export default function Home() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => fetchHealth(signal),
    retry: false,
    refetchInterval: 10000,
  });
  const status = health.isError ? "Unavailable" : health.isPending ? "Connecting…" : "Connected";
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="grow px-6 py-12 sm:px-12"
    >
      <View className="mx-auto w-full max-w-3xl flex-1 gap-16">
        <View className="flex-row items-center justify-between border-b border-border pb-6">
          <Text className="text-lg font-semibold tracking-widest">ROOK</Text>
          <Text className="font-mono text-xs text-muted-foreground">DEVELOPMENT</Text>
        </View>
        <View className="gap-6 py-8">
          <Text variant="h1" className="text-left text-5xl font-semibold sm:text-6xl">
            A team of agents, built on DSH.
          </Text>
          <Text className="max-w-xl text-lg leading-8 text-muted-foreground">
            Your workspace starts here. Rook is in early development.
          </Text>
        </View>
        <View className="gap-6 border-y border-border py-8">
          <Text variant="h2" className="border-0 text-xl">
            Workspace status
          </Text>
          <View className="flex-row items-center justify-between gap-4">
            <Text>Local API</Text>
            <Text accessibilityLiveRegion="polite" className="font-mono text-sm">
              {status}
            </Text>
          </View>
          <View className="flex-row items-center justify-between gap-4">
            <Text>Agent runtime</Text>
            <Text className="font-mono text-sm text-muted-foreground">Not configured</Text>
          </View>
          {health.isError && (
            <Text role="alert" className="text-sm text-destructive">
              Cannot reach the API. Check that the local server is running, then retry.
            </Text>
          )}
          <Button
            variant="outline"
            className="self-start"
            disabled={health.isFetching}
            onPress={() => void health.refetch()}
          >
            <Text>{health.isFetching ? "Checking…" : "Check connection"}</Text>
          </Button>
        </View>
        <Text className="pb-8 text-sm text-muted-foreground">Rook · Development workspace</Text>
      </View>
    </ScrollView>
  );
}
