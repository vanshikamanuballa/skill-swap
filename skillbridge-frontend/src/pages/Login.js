function Login() {

  return (

    <div className="container mt-5">

      <div className="card p-4 shadow">

        <h1 className="text-center mb-4">
          SkillBridge Login
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          className="form-control mb-3"
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="form-control mb-3"
        />

        <button className="btn btn-primary w-100">
          Login
        </button>

      </div>

    </div>

  );
}

export default Login;