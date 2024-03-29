"use client";

import * as React from 'react'
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Button, 
  CircularProgress, 
  Container, 
  Grid, 
  Snackbar, 
  TextField 
} from "@mui/material"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { CategoryFormProps, Category } from '@/interface/interface'
import { postCategoryData, putCategoryData } from '@/api/api'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CategoryForm(props: CategoryFormProps) {
  const t = useTranslations();
  const [loading, setLoading] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<
    "error" | "warning" | "info" | "success"
  >("success");
  const [alertOpen, setAlertOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const schema = yup
    .object({
      name: yup
        .string()
        .min(2, t("validationCategoryForm.nameMin"))
        .max(50, t("validationCategoryForm.nameMax"))
        .required(),
    })
    .required();

  const submit = async (formData: Category) => {
    setIsSubmitting(true);
    setLoading(true);

    if (!props.categoryData._id) {
      postCategoryData(formData)
        .then(() => {
          setAlertSeverity("success");
          setAlertMessage(t("alertMessageAdd.addCategorySuccess"));
          setAlertOpen(true);
          setTimeout(() => {
            setAlertMessage(null);
            setAlertOpen(false);
            router.push("/categories");
          }, 2500);
        })
        .catch(() => {
          setAlertSeverity("error");
          setAlertMessage(t("alertError.error"));
          setAlertOpen(true);
          setLoading(false);
        });
    } else {
      putCategoryData(props.categoryData._id, formData)
        .then(() => {
          setAlertSeverity("success");
          setAlertMessage(t("alertMessageEdit.editCategorySuccess"));
          setAlertOpen(true);
          setTimeout(() => {
            setAlertMessage(null);
            setAlertOpen(false);
            router.push("/categories");
          }, 2500);
        })
        .catch(() => {
          setAlertSeverity("error");
          setAlertMessage(t("alertError.error"));
          setAlertOpen(true);
          setLoading(false);
        });
    }
  };

  const cancel = () => {
    reset();
  };

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<Category>({
    defaultValues: {
      name: props.categoryData.name,
    },
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  return (
    <>
      {isSubmitting ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        !loading && (
          <Container
            sx={{
              backgroundColor: "lightgrey",
              padding: "50px",
              borderRadius: "5px",
              marginTop: "30px",
            }}
          >
            <form onSubmit={handleSubmit(submit)}>
              <Grid container rowSpacing={3}>
                <Grid item xs={12}>
                  <TextField
                    sx={{ backgroundColor: "white", borderRadius: "5px" }}
                    id="name"
                    label={t("categories-form.name")}
                    variant="outlined"
                    fullWidth
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    required
                  />
                </Grid>
                <Grid item xs={12} sx={{ textAlign: "right" }}>
                  <Button
                    sx={{
                      marginLeft: "20px",
                      width: "100px",
                      backgroundColor: "#F3F3F3",
                      color: "#000000",
                      "&:hover": {
                        backgroundColor: "#ECECEC",
                      },
                    }}
                    variant="contained"
                    onClick={cancel}
                    disabled={!isDirty}
                  >
                    {t("produits-form.cancel")}
                  </Button>
                  <Button
                    sx={{ marginLeft: "20px", width: "100px" }}
                    variant="contained"
                    type="submit"
                    disabled={!isValid || !isDirty}
                    color="primary"
                  >
                    {t("produits-form.submit")}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Container>
        )
      )}

      {alertMessage && (
        <Snackbar
          open={alertOpen}
          autoHideDuration={3000}
          onClose={() => setAlertOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={alertSeverity}>
            <AlertTitle>{alertSeverity}</AlertTitle>
            {alertMessage}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
