# Core Edition — practice tutorial

Release: 2.1.0-source.20260928

This is downloadable source software. Hosting, trading funds and external services are separate. Build and signal checks are not certification for unattended real-money execution. Complete venue and recovery validation for your installation.

## 1. Install and verify access

Finish the commands above. Sign in as the configured owner, then test a separate signed-out session. Expected result: your workspace loads, but anonymous access is rejected.

## 2. Create the first paused agent

Open Agents and choose an installed strategy. Name it clearly, select one market/interval and leave it paused with no funds allocated. Expected result: the saved strategy and status agree after reload.

## 3. Read the first decision

Use a verified paper/research path with completed candles. Record the timestamp, direction, confidence and reasoning. Expected result: a traceable signal or a valid neutral decision; no live order during this exercise.

## 4. Configure risk and ownership

Review agent and farm budgets together, maximum exposure and drawdown limits. Identify which runtime owns each position. Expected result: allocations are not counted as new deposits and duplicate strategy ownership is avoided.

## 5. Prove persistence and recovery

Pause, save settings, restart and compare the same agent and configuration. Restore a backup only in isolation. Expected result: ownership and settings survive; restoration does not create duplicate live engines.
