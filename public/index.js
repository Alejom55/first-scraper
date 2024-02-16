const $ = (el) => document.querySelector(el);

const createSchedule = async (e) => {
  e.preventDefault();
  const [username, password] = Object.values(e.target).map((el) => el.value);


  const req = await fetch("/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password }),
  });

  if (!req.ok) {
    return;
  }

  const res = await req.json();

  console.log(res);

  // const req = await fetch('/schedule', {pas})
};

$("#login").addEventListener("submit", createSchedule);
