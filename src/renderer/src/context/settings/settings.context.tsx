import { createContext, useCallback, useEffect, useState } from "react";

import { setUserPreferences } from "@renderer/features";
import { useAppDispatch } from "@renderer/hooks";
import type { UserBlocks, UserPreferences } from "@types";
import { useSearchParams } from "react-router-dom";

export interface SettingsContext {
  updateUserPreferences: (values: Partial<UserPreferences>) => Promise<void>;
  setCurrentCategoryIndex: React.Dispatch<React.SetStateAction<number>>;
  clearSourceUrl: () => void;
  sourceUrl: string | null;
  currentCategoryIndex: number;
  blockedUsers: UserBlocks["blocks"];
  fetchBlockedUsers: () => Promise<void>;
  appearanceTheme: string | null;
  appearanceAuthorId: string | null;
  appearanceAuthorName: string | null;
}

export const settingsContext = createContext<SettingsContext>({
  updateUserPreferences: async () => {},
  setCurrentCategoryIndex: () => {},
  clearSourceUrl: () => {},
  sourceUrl: null,
  currentCategoryIndex: 0,
  blockedUsers: [],
  fetchBlockedUsers: async () => {},
  appearanceTheme: null,
  appearanceAuthorId: null,
  appearanceAuthorName: null,
});

const { Provider } = settingsContext;
export const { Consumer: SettingsContextConsumer } = settingsContext;

export interface SettingsContextProviderProps {
  children: React.ReactNode;
}

export function SettingsContextProvider({
  children,
}: Readonly<SettingsContextProviderProps>) {
  const dispatch = useAppDispatch();
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [appearanceTheme, setAppearanceTheme] = useState<string | null>(null);
  const [appearanceAuthorId, setAppearanceAuthorId] = useState<string | null>(
    null
  );
  const [appearanceAuthorName, setAppearanceAuthorName] = useState<
    string | null
  >(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  const [blockedUsers, setBlockedUsers] = useState<UserBlocks["blocks"]>([]);

  const [searchParams] = useSearchParams();
  const defaultSourceUrl = searchParams.get("urls");
  const defaultAppearanceTheme = searchParams.get("theme");
  const defaultAppearanceAuthorId = searchParams.get("authorId");
  const defaultAppearanceAuthorName = searchParams.get("authorName");

  useEffect(() => {
    if (sourceUrl) setCurrentCategoryIndex(2);
  }, [sourceUrl]);

  useEffect(() => {
    if (defaultSourceUrl) {
      setSourceUrl(defaultSourceUrl);
    }
  }, [defaultSourceUrl]);

  useEffect(() => {
    if (appearanceTheme) setCurrentCategoryIndex(3);
  }, [appearanceTheme]);

  useEffect(() => {
    if (
      defaultAppearanceTheme &&
      defaultAppearanceAuthorId &&
      defaultAppearanceAuthorName
    ) {
      setAppearanceTheme(defaultAppearanceTheme);
      setAppearanceAuthorId(defaultAppearanceAuthorId);
      setAppearanceAuthorName(defaultAppearanceAuthorName);
    }
  }, [
    defaultAppearanceTheme,
    defaultAppearanceAuthorId,
    defaultAppearanceAuthorName,
  ]);

  const fetchBlockedUsers = useCallback(async () => {
    const blockedUsers = await window.electron.getBlockedUsers(12, 0);
    setBlockedUsers(blockedUsers.blocks);
  }, []);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const clearSourceUrl = () => setSourceUrl(null);

  const updateUserPreferences = async (values: Partial<UserPreferences>) => {
    await window.electron.updateUserPreferences(values);
    window.electron.getUserPreferences().then((userPreferences) => {
      dispatch(setUserPreferences(userPreferences));
    });
  };

  return (
    <Provider
      value={{
        updateUserPreferences,
        setCurrentCategoryIndex,
        clearSourceUrl,
        fetchBlockedUsers,
        currentCategoryIndex,
        sourceUrl,
        blockedUsers,
        appearanceTheme,
        appearanceAuthorId,
        appearanceAuthorName,
      }}
    >
      {children}
    </Provider>
  );
}
