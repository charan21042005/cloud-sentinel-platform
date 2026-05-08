<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00FFFF,100:FF00FF&height=300&section=header&text=CICD%20Engineering&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🚀 Phase 10: CI/CD Engineering</h3>
<p align="center"><strong>"Automating Software Delivery Like Real DevOps Teams"</strong></p>
<p align="center"><strong>Jenkins • Pipeline-as-Code • Automated Testing • Deployment Strategies</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-CICD-00FFFF?style=for-the-badge&logoColor=black" alt="CICD Phase" />
  <img src="https://img.shields.io/badge/Tool-Jenkins-FF00FF?style=for-the-badge&logo=jenkins&logoColor=white" alt="Jenkins" />
  <img src="https://img.shields.io/badge/Goal-Automation-00FFFF?style=for-the-badge&logoColor=black" alt="Goal" />
</p>

---

## 🏭 10.0 The CI/CD Revolution

Before CI/CD, engineers manually copied files to servers at midnight, hoping nothing would break. **CI/CD** changes this by making deployment a non-event.
*   **The Analogy:** Instead of handcrafting every product, we build an **Automated Assembly Line**.
*   **The Goal:** Detect, respond, and recover fast. If a human touches a server, it's a bug; if a script touches it, it's DevOps.

---

## 🔄 10.1 Understanding CI vs. CD

*   **Continuous Integration (CI):** Developers push code frequently. Jenkins automatically builds it and runs tests. If the test fails, the code is rejected immediately.
*   **Continuous Delivery (CD):** The application is *always* in a deployable state. In our project, we use **Continuous Delivery** (manual trigger for final deploy) to keep things safe.

---

## 🤖 10.2 Jenkins: The Robotic DevOps Engineer

Jenkins is our central automation server. It acts like a manager that coordinates all the workers.
*   **Jenkins Master:** The brain that schedules jobs.
*   **Jenkins Agents:** The workers that actually run the builds and tests.
*   **GitHub Webhooks:** The "Phone Call" that tells Jenkins: *"Hey, new code just arrived, start the assembly line!"*

---

## 📜 10.4 Pipeline-as-Code (The Jenkinsfile)

We don't configure Jenkins by clicking buttons. We write a **Jenkinsfile** that stays in our GitHub repo.
*   **Stages:** Build ➔ Test ➔ Dockerize ➔ Push to ECR ➔ Deploy to K8s.
*   **Benefit:** Version control for our deployment process. If our pipeline breaks, we can roll back the code just like our app.

---

## ☸️ 10.9 Kubernetes Deployment Automation

Once the new Docker image is in **AWS ECR**, Jenkins tells Kubernetes: *"Update to version 2.0."*
*   **Rolling Updates:** K8s replaces old pods with new ones one by one.
*   **Self-Healing:** If the new version crashes, Kubernetes stops the rollout.
*   **Rollbacks:** We can instantly revert using `kubectl rollout undo`.

---

## 🛡️ Advanced Deployment Strategies

These are the concepts that will impress your professors and interviewers:
1.  **Canary Deployments:** Deploying to only 5% of users first to test for bugs. (Analogy: The canary in the coal mine).
2.  **Blue-Green Deployments:** Having two identical environments; one is live, one is idle with the new version. We switch traffic instantly.

---

## ⚖️ Beginner vs. Industry CI/CD

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Deployment** | Manual (Copy-Paste) | **Fully Automated Pipeline** |
| **Testing** | "It works on my machine" | **Automated Unit & Integration Tests** |
| **Images** | Manual `docker build` | **Automated ECR Push Workflow** |
| **Safety** | No rollback plan | **Kubernetes Rolling Updates & Undo** |

---

## 🧩 Mental Models for CI/CD
1.  **Factory Assembly Line:** Code moves through automated quality checkpoints.
2.  **Domino Chain:** One successful step automatically triggers the next.
3.  **Airport Baggage System:** Your code (baggage) is automatically scanned and routed to the correct plane (environment).

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00FFFF,100:FF00FF&height=100&section=footer" width="100%" />
</p>