import React, { useState } from "react";
import Logo from "../../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import { $axios } from "../../http";
import { notification } from "../../components/notification";

export default function Login() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("projects");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { login, password } = e.target;

    try {
      const res = await $axios.post(
        "/auth/login",
        {
          login_id: login.value,
          password: password.value,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        localStorage.setItem("accessToken", res.data.accessToken);
        navigate("/");
      }
    } catch (error) {
      notification(error.response.data?.message)
    }
  };

  return (
    <>
      <div className="min-h-screen text-white">
        <div className="w-full bg-white h-[calc(100vh-40px)] rounded-2xl p-5 flex items-center">
          <div className="w-[500px] h-full flex flex-col justify-between bg-[#249B73] rounded-2xl px-10 py-10">
            <p className="uppercase text-2xl">bojxonaservis.uz</p>
            <img className="w-[250px] mx-auto" src={Logo} alt="" />
            <div className="">
              <p className="text-2xl font-semibold text-center">
                DAVLAT DAROMADIGA O'TKAZILGAN MOL-MULKNI SAQLASH VA SOTISHNING RAQAMLASHTIRILGAN TIZIMI
              </p>
            </div>

            <div className="bg-[#10865e] w-full p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 min-w-2 bg-white rounded-full"></div>
                <p>
                  Raqamli yechimlar orqali shaffoflik va samaradorlik ta'minlanadi!
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3">
                <div className="w-2 h-2 min-w-2 bg-white rounded-full"></div>
                <p>
                  Bojxona tartiblarini raqamlashtirish orqali faoliyat samaradorligini oshiradi!
                </p>
              </div>
            </div>
          </div>

          <div className="text-black px-20 w-full max-w-[600px]">
            <h2 className="text-4xl font-semibold">Kirish</h2>
            <p className="text-sm pt-3 pb-10">
              Iltimos, login va parol olish uchun bojxona servis IT jamoasiga murojaat qiling!
            </p>

            <label className="text-sm text-gray-600" htmlFor="">
              Sizning lavozimingiz nima?
            </label>
            <div className="flex gap-5">
              {/* Projects */}
              <div
                onClick={() => setSelected("projects")}
                className={`flex items-center gap-2 border p-2 w-1/2 rounded cursor-pointer transition-all
                ${
                  selected === "projects"
                    ? "border-[#249B73] text-[#249B73] bg-[#F3F8FF]"
                    : "border-gray-400 text-black"
                }`}
              >
                <div className="w-4 h-4 rounded-full border flex items-center justify-center">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selected === "projects" ? "bg-[#249B73]" : "bg-white"
                    }`}
                  ></div>
                </div>
                <span>Bojxona servis xodimi</span>
              </div>

              {/* Designs */}
              <div
                onClick={() => setSelected("designs")}
                className={`flex items-center gap-2 border p-2 w-[200px] rounded cursor-pointer transition-all
          ${
            selected === "designs"
              ? "border-[#249B73] text-[#249B73] bg-[#F3F8FF]"
              : "border-gray-400 text-black"
          }`}
              >
                <div className="w-4 h-4 rounded-full border flex items-center justify-center">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selected === "designs" ? "bg-[#249B73]" : "bg-white"
                    }`}
                  ></div>
                </div>
                <span>Rahbar</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="pt-4">
              <div>
                <label className="text-sm text-gray-600" htmlFor="login">
                  Login
                </label>
                <input
                  className="w-full text-base outline-none border border-gray-200 px-4 py-1.5 rounded-md"
                  type="text"
                  id="login"
                  name="login"
                  placeholder="admin"
                  required
                />
              </div>

              <div className="pt-4">
                <label className="text-sm text-gray-600" htmlFor="password">
                  Parol
                </label>
                <input
                  className="w-full text-base outline-none border border-gray-200 px-4 py-1.5 rounded-md"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="parol"
                  required
                />
              </div>

              <button className="mt-6 cursor-pointer hover:opacity-90 bg-[#249B73] text-white text-lg px-8 py-1 rounded-lg">
                Kirish
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
