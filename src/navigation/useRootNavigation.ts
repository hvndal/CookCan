import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

/** Stack routes live above the tab navigator — always target the parent stack. */
export function useRootNavigation() {
  const navigation = useNavigation();
  const parent = navigation.getParent() ?? navigation;
  return parent as unknown as NativeStackNavigationProp<RootStackParamList>;
}
