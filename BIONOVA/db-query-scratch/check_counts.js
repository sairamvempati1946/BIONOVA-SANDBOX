async function test() {
  const API_BASE = "http://localhost:8080/api";

  console.log("Logging in...");
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "vkpraveen216@gmail.com", password: "Kumar@2311" })
  });

  const loginData = await loginRes.json();
  const token = loginData.token;

  const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const liveTasksRes = await fetch(`${API_BASE}/task-live`, { headers: authHeaders });
  const allLiveTasks = await liveTasksRes.json();

  const liveTaskCountMap = {};
  (allLiveTasks || []).forEach(t => {
    const mId = t.mid || t.mId || t.m_id;
    if (mId) {
      liveTaskCountMap[mId] = (liveTaskCountMap[mId] || 0) + 1;
    }
  });

  console.log("liveTaskCountMap:", liveTaskCountMap);

  const liveProjectsRes = await fetch(`${API_BASE}/project-live`, { headers: authHeaders });
  const liveProjects = await liveProjectsRes.json();

  let liveMilestones = [];
  const livePromises = (liveProjects || []).map(p =>
    fetch(`${API_BASE}/project-live/${p.prjId}/milestones`, { headers: authHeaders })
      .then(res => res.json())
      .then(ms => (ms || []).map(m => ({ ...m, project: p })))
      .catch(() => [])
  );
  const results = await Promise.all(livePromises);
  liveMilestones = results.flat();

  const liveList = (liveMilestones || []).map(m => {
    const id = m.mid || m.mId || m.id;
    return {
      type: 'live',
      id: id,
      code: m.mlstnCd || m.code,
      title: m.mlstnTtl || m.mlstnNm || m.title,
      taskCount: liveTaskCountMap[id] || 0,
      status: m.mlstnSts || 'LIVE'
    };
  });

  console.log("liveList milestones with non-zero taskCount:");
  console.log(liveList.filter(m => m.taskCount > 0));
}

test().catch(console.error);
