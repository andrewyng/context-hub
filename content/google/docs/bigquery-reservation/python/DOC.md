---
name: bigquery-reservation
description: "Google Cloud BigQuery Reservation Python client for reservation admin, assignments, and capacity commitments"
metadata:
  languages: "python"
  versions: "1.22.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,gcp,bigquery,reservations,capacity-commitments,slots,python"
---

# google-cloud-bigquery-reservation Python Package Guide

## Golden Rule

Use `google-cloud-bigquery-reservation` with `from google.cloud import bigquery_reservation_v1`, authenticate with Google Cloud Application Default Credentials (ADC), and build full location or reservation resource names instead of hand-assembling partial IDs.

This package is for BigQuery reservation administration: reservations, assignments, capacity commitments, and related control-plane operations. It is not the package you use to run SQL queries; that is `google-cloud-bigquery`.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-bigquery-reservation==1.22.0"
```

Common alternatives:

```bash
uv add "google-cloud-bigquery-reservation==1.22.0"
poetry add "google-cloud-bigquery-reservation==1.22.0"
```

## Authentication And Setup

Enable the Reservation API and set up ADC before writing code:

```bash
gcloud services enable bigqueryreservation.googleapis.com
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT="admin-project-id"
export BIGQUERY_LOCATION="US"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/abs/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="admin-project-id"
export BIGQUERY_LOCATION="US"
```

Practical setup notes:

- Reservations and capacity commitments are regional or multi-regional resources. Use the same location consistently in your client calls and resource names.
- The caller needs BigQuery Reservation Admin style permissions on the admin project, and assignment operations also depend on permissions over the assignee project, folder, or organization.
- For most local and deployed Google Cloud workloads, ADC is the intended credential flow.

## Initialize A Client

Use one `ReservationServiceClient` and derive parent paths from helper methods:

```python
import os

from google.cloud import bigquery_reservation_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")

client = bigquery_reservation_v1.ReservationServiceClient()
location_path = client.common_location_path(project_id, location)
```

Explicit service account credentials:

```python
from google.cloud import bigquery_reservation_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/abs/path/service-account.json"
)

client = bigquery_reservation_v1.ReservationServiceClient(
    credentials=credentials,
)
```

## Common Workflows

### Inspect Current Reservations And Commitments

List reservations and capacity commitments before changing anything:

```python
import os

from google.cloud import bigquery_reservation_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")

client = bigquery_reservation_v1.ReservationServiceClient()
parent = client.common_location_path(project_id, location)

print("Reservations:")
for reservation in client.list_reservations(parent=parent):
    print(
        reservation.name,
        reservation.edition.name,
        reservation.slot_capacity,
        reservation.ignore_idle_slots,
    )

print("Capacity commitments:")
for commitment in client.list_capacity_commitments(parent=parent):
    print(
        commitment.name,
        commitment.plan.name,
        commitment.slot_count,
        commitment.edition.name,
        commitment.state.name,
    )
```

### Create A Reservation

Create the reservation in the admin project and location where you manage slots:

```python
import os

from google.cloud import bigquery_reservation_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")

client = bigquery_reservation_v1.ReservationServiceClient()
parent = client.common_location_path(project_id, location)

reservation = bigquery_reservation_v1.Reservation(
    edition=bigquery_reservation_v1.Edition.STANDARD,
    slot_capacity=100,
    ignore_idle_slots=False,
)

created = client.create_reservation(
    parent=parent,
    reservation=reservation,
    reservation_id="analytics-prod",
)

print(created.name)
```

Use a stable `reservation_id`; the full resource name will look like `projects/admin-project-id/locations/US/reservations/analytics-prod`.

### Assign A Project To A Reservation

Assignments attach a project, folder, or organization assignee to a reservation for a specific job type:

```python
import os

from google.cloud import bigquery_reservation_v1

admin_project = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")
consumer_project = "consumer-project-id"

client = bigquery_reservation_v1.ReservationServiceClient()
parent = client.reservation_path(admin_project, location, "analytics-prod")

assignment = bigquery_reservation_v1.Assignment(
    assignee=f"projects/{consumer_project}",
    job_type=bigquery_reservation_v1.Assignment.JobType.QUERY,
)

created = client.create_assignment(
    parent=parent,
    assignment=assignment,
)

print(created.name)
```

Common assignee forms are:

- `projects/PROJECT_ID`
- `folders/FOLDER_NUMBER`
- `organizations/ORGANIZATION_NUMBER`

### Find Effective Assignments For A Project

Use `search_all_assignments()` when you need to understand what a project currently inherits in one location:

```python
import os

from google.cloud import bigquery_reservation_v1

location = os.environ.get("BIGQUERY_LOCATION", "US")
consumer_project = "consumer-project-id"

client = bigquery_reservation_v1.ReservationServiceClient()

for assignment in client.search_all_assignments(
    parent=f"projects/-/locations/{location}",
    query=f"assignee=projects/{consumer_project}",
):
    print(assignment.name, assignment.job_type.name)
```

This is the practical way to debug whether a project is using the reservation you expect.

### Move An Assignment To A Different Reservation

Move the assignment by name when you need to repoint an existing workload:

```python
import os

from google.cloud import bigquery_reservation_v1

admin_project = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")
assignment_name = (
    f"projects/{admin_project}/locations/{location}/reservations/"
    "analytics-prod/assignments/123456789"
)

client = bigquery_reservation_v1.ReservationServiceClient()

moved = client.move_assignment(
    name=assignment_name,
    destination_id="analytics-batch",
)

print(moved.name)
```

`destination_id` is the target reservation ID in the same admin project and location.

### Purchase A Capacity Commitment

Capacity commitments are the slot commitments that back reservations:

```python
import os

from google.cloud import bigquery_reservation_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")

client = bigquery_reservation_v1.ReservationServiceClient()
parent = client.common_location_path(project_id, location)

commitment = bigquery_reservation_v1.CapacityCommitment(
    slot_count=100,
    plan=bigquery_reservation_v1.CapacityCommitment.CommitmentPlan.FLEX,
    edition=bigquery_reservation_v1.Edition.STANDARD,
)

created = client.create_capacity_commitment(
    parent=parent,
    capacity_commitment=commitment,
)

print(created.name, created.state.name)
```

Use the commitment plan that matches your billing and lifecycle requirements. Flex commitments are the shortest-lived option; annual and multi-year commitments have longer lock-in and renewal behavior.

### Update Reservation Capacity

Update only the fields you intend to change by passing a field mask:

```python
import os

from google.cloud import bigquery_reservation_v1
from google.protobuf import field_mask_pb2

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("BIGQUERY_LOCATION", "US")

client = bigquery_reservation_v1.ReservationServiceClient()

reservation = bigquery_reservation_v1.Reservation(
    name=client.reservation_path(project_id, location, "analytics-prod"),
    slot_capacity=200,
)

updated = client.update_reservation(
    reservation=reservation,
    update_mask=field_mask_pb2.FieldMask(paths=["slot_capacity"]),
)

print(updated.name, updated.slot_capacity)
```

## Common Pitfalls

### Reservation admin is a separate API surface

Enable `bigqueryreservation.googleapis.com` explicitly. BigQuery query access alone does not enable reservation administration.

### Resource names must be complete

Use helper methods like `common_location_path()` and `reservation_path()` instead of passing bare location names or reservation IDs to methods that expect full resource names.

### Assignment rules are strict

A given assignee can only have one assignment per job type in one location. If a project inherits assignments from multiple levels, the more specific resource wins.

### Assignment changes are not always immediate for billing

Google's reservation docs note that after creating or updating an assignment, you should allow roughly five minutes before expecting workloads to be billed and scheduled according to the new assignment.

### Capacity commitments are location-bound

Commitments are regional resources. You cannot move them between locations, and deletion rules depend on the commitment plan and state.

### Reservation capacity and autoscaling settings interact

The Reservation API exposes `slot_capacity`, `ignore_idle_slots`, `autoscale`, `max_slots`, and `scaling_mode`. If you use autoscaling or slot upper bounds, follow the Reservation type docs carefully because some fields are mutually constrained.

## Version-Sensitive Notes

- PyPI lists `google-cloud-bigquery-reservation 1.22.0`, released on January 9, 2026.
- The hosted Google Cloud Python reference is the authoritative API surface, but generated pages and changelog pages can lag each other. Confirm the version you have installed when copying signatures from hosted docs.
- PyPI classifies this release for Python `>=3.7` and includes current classifiers through Python 3.14.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-bigquery-reservation/
- Maintainer package docs: https://cloud.google.com/python/docs/reference/bigqueryreservation/latest
- `ReservationServiceClient` reference: https://cloud.google.com/python/docs/reference/bigqueryreservation/latest/google.cloud.bigquery_reservation_v1.services.reservation_service.ReservationServiceClient
- Reservation type reference: https://cloud.google.com/python/docs/reference/bigqueryreservation/latest/google.cloud.bigquery_reservation_v1.types.Reservation
- CapacityCommitment type reference: https://cloud.google.com/python/docs/reference/bigqueryreservation/latest/google.cloud.bigquery_reservation_v1.types.CapacityCommitment
- BigQuery Reservations introduction: https://cloud.google.com/bigquery/docs/reservations-intro
- Get started with Reservations: https://cloud.google.com/bigquery/docs/reservations-get-started
- Use Reservations with assignments: https://cloud.google.com/bigquery/docs/reservations-workload-management
- ADC overview: https://cloud.google.com/docs/authentication/provide-credentials-adc
