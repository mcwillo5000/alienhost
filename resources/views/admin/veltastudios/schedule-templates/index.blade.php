@extends('layouts.admin')

@section('title')
    Schedule Template Manager
@endsection

@section('content-header')
    <h1><i class="fa fa-calendar"></i> Schedule Template Manager <small>Manage your schedule templates</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}"><i class="fa fa-dashboard"></i> Admin</a></li>
        <li><i class="fa fa-cogs"></i> Velta Studios</li>
        <li class="active"><i class="fa fa-calendar"></i> Schedule Template Manager</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-xs-12">
            <div id="version-alert" class="alert alert-warning" style="display: none;">
                <i class="fa fa-exclamation-triangle"></i> You are not using the latest version of the addon. Please update to the latest version.
            </div>
            @if (session('success'))
                <div class="alert alert-success">
                    <i class="fa fa-check"></i> {{ session('success') }}
                </div>
            @endif

            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-list-alt"></i> Templates</h3>
                    <div class="box-tools pull-right">
                        <a href="{{ route('admin.veltastudios.schedule-templates.create') }}" class="btn btn-success btn-sm">
                            <i class="fa fa-plus"></i> Create New Template
                        </a>
                    </div>
                </div>
                <div class="box-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <p class="text-muted">
                                <strong><i class="fa fa-code-fork"></i> Current Version:</strong> <span id="current-version">1.0.2</span> |
                                <strong><i class="fa fa-support"></i> Support:</strong> <a href="https://discord.gg/adNXC8VeSv" target="_blank">Discord</a>
                            </p>
                        </div>
                        <div class="col-md-6 text-right">
                            <p>
                                Manage schedule templates to automate tasks on your server. Create, edit, or delete templates to suit your needs.
                            </p>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th><i class="fa fa-file-text-o"></i> Name</th>
                                    <th><i class="fa fa-align-left"></i> Description</th>
                                    <th class="text-center"><i class="fa fa-cogs"></i> Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($templates as $template)
                                    <tr>
                                        <td>{{ $template->name }}</td>
                                        <td>{{ $template->description }}</td>
                                        <td class="text-center">
                                            <a href="{{ route('admin.veltastudios.schedule-templates.edit', $template->id) }}" class="btn btn-primary btn-sm">
                                                <i class="fa fa-edit"></i> Edit
                                            </a>
                                            <form action="{{ route('admin.veltastudios.schedule-templates.destroy', $template->id) }}" method="POST" style="display:inline;">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-danger btn-sm">
                                                    <i class="fa fa-trash"></i> Delete
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="box-footer text-center">
                    {{ $templates->links() }}
                </div>
            </div>

            <footer class="text-center">
                <p>Developed by <a href="https://discord.gg/adNXC8VeSv" target="_blank">Velta Studios</a></p>
            </footer>
        </div>
    </div>
@endsection

@section('styles')
    <style>
        .box-title {
            display: flex;
            align-items: center;
        }
        .box-title i {
            margin-right: 10px;
        }
        .box-tools .btn {
            margin-left: 10px;
        }
        .table-responsive {
            margin-top: 20px;
        }
        .table-hover > tbody > tr:hover {
            background-color: #f5f5f5;
        }
        .alert {
            margin-top: 20px;
        }
        .text-center.text-muted {
            margin-top: 20px;
            font-size: 1.1em;
        }
    </style>
@endsection

@section('footer-scripts')
    @parent
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const currentVersion = document.getElementById('current-version').innerText;

            fetch('{{ route('admin.veltastudios.schedule-templates.version') }}')
                .then(response => response.json())
                .then(data => {
                    if (data.version && data.version !== currentVersion) {
                        document.getElementById('version-alert').style.display = 'block';
                    }
                })
                .catch(error => {
                    console.error('Error fetching version:', error);
                });
        });
    </script>
@endsection