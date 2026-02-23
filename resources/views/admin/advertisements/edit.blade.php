@extends('layouts.admin')

@section('title')
    Edit Advertisement
@endsection

@section('content-header')
    <h1>Edit Advertisement<small>Update advertisement settings</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.advertisements.index') }}">Advertisements</a></li>
        <li class="active">Edit</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-xs-12">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Advertisement Details</h3>
                </div>
                <form action="{{ route('admin.advertisements.update', $advertisement->id) }}" method="POST">
                    @csrf
                    @method('PATCH')
                    <div class="box-body">
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" class="form-control" id="name" name="name" value="{{ old('name', $advertisement->name) }}" placeholder="e.g., Hosting Advertisement" required>
                            <p class="text-muted small">A descriptive name for this advertisement.</p>
                        </div>

                        <div class="form-group">
                            <label for="nest_id">Nest</label>
                            <select class="form-control" id="nest_id" name="nest_id" required>
                                <option value="">Select a nest...</option>
                                @foreach($nests as $nest)
                                    <option value="{{ $nest->id }}" {{ old('nest_id', $advertisement->nest_id ?? '') == $nest->id ? 'selected' : '' }}>
                                        {{ $nest->name }}
                                    </option>
                                @endforeach
                            </select>
                            <p class="text-muted small">Select the nest this advertisement applies to. All servers using eggs from this nest will receive this advertisement.</p>
                        </div>

                        <div class="form-group">
                            <label>Commands</label>
                            <div id="commands-container" style="max-width: 100%; overflow-x: auto;">
                                @php
                                    $commands = old('commands', is_array($advertisement->commands) ? $advertisement->commands : [$advertisement->commands ?? 'say This server is hosted by YourHosting']);
                                    if (empty($commands) || (count($commands) === 1 && empty($commands[0]))) {
                                        $commands = ['say This server is hosted by YourHosting'];
                                    }
                                @endphp
                                @foreach($commands as $index => $command)
                                    <div class="command-row" style="margin-bottom: 10px;">
                                        <div class="input-group" style="display: table; width: 100%;">
                                            <input type="text" class="form-control command-input" name="commands[]" value="{{ $command }}" placeholder="say Your message here" style="display: table-cell; width: 100%;" required>
                                            <span class="input-group-btn" style="display: table-cell; width: 1%; white-space: nowrap; vertical-align: middle;">
                                                <button type="button" class="btn btn-danger remove-command" style="display: {{ count($commands) > 1 ? '' : 'none' }}; white-space: nowrap;">
                                                    <i class="fa fa-trash"></i>
                                                </button>
                                            </span>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                            <button type="button" class="btn btn-success btn-sm" id="add-command">
                                <i class="fa fa-plus"></i> Add Command
                            </button>
                            <p class="text-muted small">The console commands to execute (without leading slash). Examples: <code>say Message</code>, <code>tellraw @a {"text":"Message"}</code></p>
                        </div>

                        <div class="form-group">
                            <label for="interval_minutes">Interval (Minutes)</label>
                            <input type="number" class="form-control" id="interval_minutes" name="interval_minutes" value="{{ old('interval_minutes', $advertisement->interval_minutes) }}" min="1" max="1440" required>
                            <p class="text-muted small">How often to send this advertisement (1-1440 minutes).</p>
                        </div>

                        <div class="form-group">
                            <label>
                                <input type="checkbox" name="is_active" value="1" {{ old('is_active', $advertisement->is_active) ? 'checked' : '' }}>
                                Active
                            </label>
                            <p class="text-muted small">Only active advertisements will be sent to servers.</p>
                        </div>
                    </div>
                    <div class="box-footer">
                        <a href="{{ route('admin.advertisements.index') }}" class="btn btn-default" onclick="window.location.href='{{ route('admin.advertisements.index') }}'; return false;">Cancel</a>
                        <button type="submit" class="btn btn-primary pull-right">Update Advertisement</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const container = document.getElementById('commands-container');
            const addButton = document.getElementById('add-command');
            
            function updateRemoveButtons() {
                const rows = container.querySelectorAll('.command-row');
                rows.forEach((row, index) => {
                    const removeBtn = row.querySelector('.remove-command');
                    if (rows.length > 1) {
                        removeBtn.style.display = '';
                    } else {
                        removeBtn.style.display = 'none';
                    }
                });
            }
            
            addButton.addEventListener('click', function() {
                const newRow = document.createElement('div');
                newRow.className = 'command-row';
                newRow.style.marginBottom = '10px';
                newRow.innerHTML = `
                    <div class="input-group" style="display: table; width: 100%;">
                        <input type="text" class="form-control command-input" name="commands[]" placeholder="say Your message here" style="display: table-cell; width: 100%;" required>
                        <span class="input-group-btn" style="display: table-cell; width: 1%; white-space: nowrap; vertical-align: middle;">
                            <button type="button" class="btn btn-danger remove-command" style="white-space: nowrap;">
                                <i class="fa fa-trash"></i>
                            </button>
                        </span>
                    </div>
                `;
                container.appendChild(newRow);
                updateRemoveButtons();
                
                newRow.querySelector('.remove-command').addEventListener('click', function() {
                    newRow.remove();
                    updateRemoveButtons();
                });
            });
            
            container.addEventListener('click', function(e) {
                if (e.target.closest('.remove-command')) {
                    e.target.closest('.command-row').remove();
                    updateRemoveButtons();
                }
            });
            
            updateRemoveButtons();
        });
    </script>

@endsection

