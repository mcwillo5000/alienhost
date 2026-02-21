<!-- resources/views/admin/veltastudios/schedule-templates/create.blade.php -->

@extends('layouts.admin')

@section('title')
    Create Schedule Template
@endsection

@section('content-header')
    <h1>Create Schedule Template<small>Fill in the details to create a new schedule template</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.veltastudios.schedule-templates') }}">Schedule Template Manager</a></li>
        <li class="active">Create Schedule Template</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-md-12">
            @if (session('success'))
                <div class="alert alert-success">
                    {{ session('success') }}
                </div>
            @endif
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">New Template</h3>
                </div>
                <form action="{{ route('admin.veltastudios.schedule-templates.store') }}" method="POST">
                    @csrf
                    <div class="box-body">
                        <h4>Schedule</h4>
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" name="name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <input type="text" name="description" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Cron Schedule</label>
                            <div class="row">
                                <div class="form-group col-md-2 col-xs-6">
                                    <label for="cron-minute">Minute</label>
                                    <input type="text" name="cron[minute]" class="form-control" placeholder="*" required>
                                </div>
                                <div class="form-group col-md-2 col-xs-6">
                                    <label for="cron-hour">Hour</label>
                                    <input type="text" name="cron[hour]" class="form-control" placeholder="*" required>
                                </div>
                                <div class="form-group col-md-2 col-xs-6">
                                    <label for="cron-dayOfMonth">Day of Month</label>
                                    <input type="text" name="cron[dayOfMonth]" class="form-control" placeholder="*" required>
                                </div>
                                <div class="form-group col-md-2 col-xs-6">
                                    <label for="cron-month">Month</label>
                                    <input type="text" name="cron[month]" class="form-control" placeholder="*" required>
                                </div>
                                <div class="form-group col-md-2 col-xs-6">
                                    <label for="cron-dayOfWeek">Day of Week</label>
                                    <input type="text" name="cron[dayOfWeek]" class="form-control" placeholder="*" required>
                                </div>
                            </div>
                        </div>

                        <h4>Tasks</h4>
                        <div class="box-body table-responsive no-padding">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Payload</th>
                                        <th>Time Offset</th>
                                        <th>Continue on Failure</th>
                                        <th>Remove</th>
                                    </tr>
                                </thead>
                                <tbody id="tasks-container">
                                    <tr class="task">
                                        <td>
                                            <select name="tasks[0][action]" class="form-control action-select" required>
                                                <option value="command">Send Command</option>
                                                <option value="power">Send Power Action</option>
                                                <option value="backup">Create Backup</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input type="text" name="tasks[0][payload]" class="form-control payload-input" required>
                                        </td>
                                        <td>
                                            <input type="number" name="tasks[0][timeOffset]" class="form-control" required>
                                        </td>
                                        <td>
                                            <select name="tasks[0][continueOnFailure]" class="form-control" required>
                                                <option value="1">Yes</option>
                                                <option value="0">No</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn-danger btn-sm remove-task">
                                                <i class="fa fa-times"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="text-center">
                            <button type="button" class="btn btn-primary btn-sm" id="add-task">
                                <i class="fa fa-plus"></i> Add Task
                            </button>
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-success">Create Template</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        let taskIndex = 1;

        document.getElementById('add-task').addEventListener('click', function() {
            const taskTemplate = `
                <tr class="task">
                    <td>
                        <select name="tasks[${taskIndex}][action]" class="form-control action-select" required>
                            <option value="command">Send Command</option>
                            <option value="power">Send Power Action</option>
                            <option value="backup">Create Backup</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" name="tasks[${taskIndex}][payload]" class="form-control payload-input" required>
                    </td>
                    <td>
                        <input type="number" name="tasks[${taskIndex}][timeOffset]" class="form-control" required>
                    </td>
                    <td>
                        <select name="tasks[${taskIndex}][continueOnFailure]" class="form-control" required>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm remove-task">
                            <i class="fa fa-times"></i>
                        </button>
                    </td>
                </tr>
            `;

            const tasksContainer = document.getElementById('tasks-container');
            tasksContainer.insertAdjacentHTML('beforeend', taskTemplate);
            taskIndex++;
        });

        document.getElementById('tasks-container').addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('remove-task')) {
                e.target.closest('tr').remove();
            }
        });

        document.getElementById('tasks-container').addEventListener('change', function(e) {
            if (e.target && e.target.classList.contains('action-select')) {
                const row = e.target.closest('tr');
                const payloadCell = row.querySelector('.payload-input').closest('td');
                const currentTaskIndex = row.rowIndex - 1;
                if (e.target.value === 'power') {
                    payloadCell.innerHTML = `
                        <select name="tasks[${currentTaskIndex}][payload]" class="form-control payload-input" required>
                            <option value="start">Start the server</option>
                            <option value="restart">Restart the server</option>
                            <option value="stop">Stop the server</option>
                            <option value="terminate">Terminate the server</option>
                        </select>
                    `;
                } else if (e.target.value === 'backup') {
                    payloadCell.innerHTML = `
                        <input type="text" name="tasks[${currentTaskIndex}][payload]" class="form-control payload-input" placeholder="Ignored files (optional)">
                    `;
                } else {
                    payloadCell.innerHTML = `
                        <input type="text" name="tasks[${currentTaskIndex}][payload]" class="form-control payload-input" required>
                    `;
                }
            }
        });
    </script>
@endsection

@section('styles')
    <style>
        .form-group {
            margin-bottom: 20px;
        }
        .table-hover>tbody>tr:hover {
            background-color: #f5f5f5;
        }
        .task td {
            vertical-align: middle;
        }
        .btn-sm {
            margin: 5px 0;
        }
        .box-footer {
            margin-top: 20px;
        }
        .box-body.table-responsive {
            border: none;
        }
    </style>
@endsection