import { useTranslation } from "react-i18next";

const test = () => {
  const { t } = useTranslation();
  t("Nice");
  t("Wow");
};
