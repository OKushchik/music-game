'use client'
import {LoginForm} from "@/src/app/components/auth/LoginForm";
import {Button} from "@mui/material";
import {RegisterForm} from "@/src/app/components/auth/RegisterForm";
import React, {useState} from "react";
import {FormType, formTypes} from "@/src/models/models";

export default function Login() {
  const [formType, setFormType] = useState<FormType>(formTypes.LOGIN);
  return (
    <main className="main">
      <div className='auth-page'>
        <div className='auth-page__wrapper'>
          <h1 className='web-title'>Music Game</h1>
          {formType === formTypes.LOGIN && <LoginForm />}
          {formType === formTypes.REGISTER && <RegisterForm />}
          <Button
            variant="text"
            style={{marginLeft:'auto', display:'block', marginTop:"10px"}}
            onClick={() =>
              setFormType(
                formType === formTypes.LOGIN
                  ? formTypes.REGISTER
                  : formTypes.LOGIN
              )
            }
          >
            {formType === formTypes.LOGIN ? "Register form" : "Login form"}
          </Button>
        </div>
      </div>
    </main>
  );
}
