import { useTranslation } from "react-i18next";

const test = () => {
  const { t } = useTranslation();
  t("Nice");
  t("Wow");
  t("I'm a test with single quote");
  t('he said: "I\'m gonna test the double quote"');
  return t("Apakah benar?");
};
