@extends('layouts.admin')

@section('title')
    Advanced Permissions
@endsection

@section('content-header')
    <h1>Advanced Permissions<small>Manage custom admin roles and assign them to users.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Advanced Permissions</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-xs-12">


            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Roles</h3>
                    <div class="box-tools">
                        <a href="{{ route('admin.advanced-permissions.server-groups') }}"
                           class="btn btn-sm btn-default" style="margin-right:6px">
                            <i class="fa fa-server"></i> Server Groups
                        </a>
                        <a href="{{ route('admin.advanced-permissions.create') }}">
                            <button type="button" class="btn btn-sm btn-primary">
                                <i class="fa fa-plus"></i> Create Role
                            </button>
                        </a>
                    </div>
                </div>

                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th style="width:40px">#</th>
                                <th>Role Name</th>
                                <th>Description</th>
                                <th>Users</th>
                                <th>Permissions</th>
                                <th style="width:100px">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($roles as $role)
                                <tr>
                                    <td>{{ $role->id }}</td>
                                    <td>
                                        <strong>{{ $role->name }}</strong>
                                    </td>
                                    <td class="text-muted">
                                        {{ $role->description ?: '—' }}
                                    </td>
                                    <td>
                                        <span class="badge bg-blue">{{ $role->users_count }}</span>
                                    </td>
                                    <td>
                                        <span class="badge bg-green">{{ $role->route_count }}</span>
                                    </td>
                                    <td>
                                        <a href="{{ route('admin.advanced-permissions.edit', $role->id) }}"
                                           class="btn btn-xs btn-default">
                                            <i class="fa fa-pencil"></i> Edit
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center text-muted" style="padding:30px">
                                        No roles created yet.
                                        <a href="{{ route('admin.advanced-permissions.create') }}">Create the first one.</a>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                @if ($roles->hasPages())
                    <div class="box-footer clearfix">
                        <div class="col-md-12 text-center">
                            {!! $roles->render() !!}
                        </div>
                    </div>
                @endif
            </div>

        </div>
    </div>
@endsection
